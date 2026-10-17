'use client';
import React, { useState } from 'react';
import { User, Lock, Mail, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { canAccessModule, getUserModule, getUserPortalUrl, SARA_MODULES } from '@/lib/auth/moduleGuards';

export default function TalentoAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPortal, setRedirectPortal] = useState<{ url: string; name: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRedirectPortal(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;

        // Guard de segregación de módulo
        const userMeta = data.user.user_metadata || {};
        if (!canAccessModule(userMeta, 'sara_talento')) {
          await supabase.auth.signOut();
          const userMod = getUserModule(userMeta);
          const modDef = SARA_MODULES[userMod];
          const portalUrl = getUserPortalUrl(userMeta);
          setRedirectPortal({
            url: portalUrl,
            name: modDef?.name || 'tu módulo correspondiente'
          });
          throw new Error(
            `Acceso restringido: Esta cuenta está registrada en "${modDef?.name || 'otro módulo'}". Para ingresar a SARA Talento debes usar tu cuenta profesional o acceder desde tu portal correspondiente.`
          );
        }

        router.push('/modulos/talento/mi-perfil');
      } else {
        if (!nombre) {
          throw new Error('Por favor ingresa tu nombre completo.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: nombre,
              role: 'cuadrilla',
              modulo_origen: 'sara_talento',
              modulos_autorizados: ['sara_talento']
            }
          }
        });
        if (signUpError) throw signUpError;

        await supabase.auth.signInWithPassword({ email, password });
        router.push('/modulos/talento/mi-perfil');
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* Panel Informativo */}
        <div className="w-full md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-center">
          <Briefcase className="w-12 h-12 text-blue-500 mb-6" />
          <h1 className="text-4xl font-bold mb-4">SARA Talento</h1>
          <p className="text-slate-300 text-lg mb-8">
            El portal exclusivo para que ingenieros, arquitectos y maestros de obra conecten con las constructoras más grandes de Ecuador.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center text-slate-300"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Geolocalización en mapa para obras cercanas</li>
            <li className="flex items-center text-slate-300"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Gestión de CV y certificaciones</li>
            <li className="flex items-center text-slate-300"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Historial de contrataciones centralizado</li>
          </ul>
        </div>

        {/* Panel Formulario */}
        <div className="w-full md:w-1/2 p-12 bg-white">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Profesional'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLogin ? 'Accede a tu panel para gestionar tu disponibilidad.' : 'Únete a la red y recibe ofertas de trabajo directo.'}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
              {redirectPortal && (
                <div className="pt-2">
                  <Link
                    href={redirectPortal.url}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Ir a {redirectPortal.name} →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    required 
                    type="text" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Ej. Javier Sarango" 
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="correo@ejemplo.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  required 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? 'Procesando...' : (isLogin ? 'Ingresar a mi Portal' : 'Registrarme ahora')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setRedirectPortal(null);
              }} 
              className="text-blue-600 font-medium text-sm hover:underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/modulos/talento" className="text-slate-500 text-sm hover:text-slate-800 transition-colors">
              Volver al Radar Público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
