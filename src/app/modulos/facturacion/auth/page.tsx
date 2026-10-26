'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileCheck2, 
  Mail, 
  Lock, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Percent,
  Receipt
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function FacturacionAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [tipoContribuyente, setTipoContribuyente] = useState<'PROFESIONAL' | 'CONSTRUCCION' | 'PYME' | 'EMPRESA'>('PROFESIONAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;

        if (typeof window !== 'undefined') {
          localStorage.setItem('sara_facturacion_auth_email', email);
        }
        router.push('/modulos/facturacion');
      } else {
        if (!ruc || ruc.length !== 13) {
          throw new Error('Por favor ingresa un RUC válido de 13 dígitos del Ecuador.');
        }
        if (!razonSocial) {
          throw new Error('Por favor ingresa tu nombre completo o razón social.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: razonSocial,
              ruc: ruc,
              tipo_contribuyente: tipoContribuyente,
              role: 'emisor_facturacion',
              modulo_origen: 'sara_facturacion'
            }
          }
        });
        if (signUpError) throw signUpError;

        // Auto login
        await supabase.auth.signInWithPassword({ email, password });
        if (typeof window !== 'undefined') {
          localStorage.setItem('sara_facturacion_auth_email', email);
          localStorage.setItem('sara_facturacion_auth_ruc', ruc);
          localStorage.setItem('sara_facturacion_auth_razon', razonSocial);
        }
        router.push('/modulos/facturacion');
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LADO IZQUIERDO: BRANDING INSTITUCIONAL */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-8 md:p-10 text-slate-950 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <FileCheck2 className="w-96 h-96" />
          </div>
          
          <div className="relative z-10">
            <Link href="/facturacion-electronica" className="inline-flex items-center gap-2.5 font-black text-2xl mb-8">
              <div className="bg-slate-950 p-2 rounded-xl text-amber-500 shadow-lg">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="tracking-tight">SARA <span className="text-slate-950 font-black">Facturación</span></span>
            </Link>
            
            <h2 className="text-3xl font-black mb-3 leading-tight text-slate-950 tracking-tight">
              Portal Emisor SRI & Firma Digital Express.
            </h2>
            <p className="font-semibold text-amber-950/80 text-sm mb-6 leading-relaxed">
              Emite facturas y retenciones autorizadas en segundos con cálculo de tarifa IVA 15% y 5% de construcción bajo normativa SRI 2026.
            </p>

            <div className="bg-slate-950/10 border border-slate-950/20 p-3.5 rounded-2xl mb-6 backdrop-blur-xs">
              <p className="text-xs font-black text-slate-950 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                Acreditado ARCOTEL & Homologado SRI
              </p>
              <p className="text-[11px] text-slate-900 leading-tight">
                Pases diarios on-demand ($1.50), bolsas prepago que no caducan ($3.99) y certificados de firma digital .p12 para personas naturales y empresas.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-4 border-t border-amber-600/30">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Emisión ágil desde celular o computador (Web + PWA)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Bóveda de Firma .p12 con cifrado biométrico</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Proyección automática Formulario 104 y deducción de gastos</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: FORMULARIO */}
        <div className="w-full md:w-7/12 p-8 md:p-10 bg-slate-900 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-black text-white">
                {isLogin ? 'Ingresar a mi Facturación' : 'Registrar Contribuyente'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLogin ? 'Ingresa tus credenciales para acceder a tu panel SRI' : 'Crea tu cuenta para emitir comprobantes o gestionar tu firma'}
              </p>
            </div>
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {isLogin ? '¿Nuevo emisor? Regístrate' : 'Ya tengo cuenta'}
            </button>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campos adicionales de Registro */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      RUC del Contribuyente (13 dígitos) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={13}
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                      placeholder="1792984512001"
                      className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Tipo de Actividad
                    </label>
                    <select
                      value={tipoContribuyente}
                      onChange={(e) => setTipoContribuyente(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="PROFESIONAL">Profesional Independiente</option>
                      <option value="CONSTRUCCION">Contratista / Obras</option>
                      <option value="PYME">Comercio / PYME</option>
                      <option value="EMPRESA">Compañía S.A. / Cía. Ltda.</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Razón Social / Nombres y Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="ING. CARLOS MENDOZA ARQUITECTURA"
                    className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contribuyente@sara.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Contraseña de Acceso *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span>Verificando credenciales...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Ingresar a SARA Facturación' : 'Registrar y Comenzar a Emitir'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Acceso demo directo */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link
              href="/modulos/facturacion"
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium flex items-center justify-center gap-1.5"
            >
              <span>Explorar entorno de demostración sin iniciar sesión</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}