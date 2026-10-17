'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Mail, Lock, User, ChevronRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { canAccessModule, getUserModule, getUserPortalUrl, SARA_MODULES } from '@/lib/auth/moduleGuards';

export default function FletesAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [placa, setPlaca] = useState('');
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
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;

        // Guard de segregación de módulo
        const userMeta = data.user.user_metadata || {};
        if (!canAccessModule(userMeta, 'sara_fletes')) {
          await supabase.auth.signOut();
          const userMod = getUserModule(userMeta);
          const modDef = SARA_MODULES[userMod];
          const portalUrl = getUserPortalUrl(userMeta);
          setRedirectPortal({
            url: portalUrl,
            name: modDef?.name || 'tu módulo correspondiente'
          });
          throw new Error(
            `Acceso restringido: Esta cuenta está registrada en "${modDef?.name || 'otro módulo'}". Para ingresar al Radar de Fletes debes usar una cuenta de Transportista o acceder desde tu portal correspondiente.`
          );
        }

        router.push('/modulos/fletes/mi-perfil');
      } else {
        if (!nombre || !placa) {
          throw new Error('Por favor completa todos los campos del vehículo.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: nombre,
              placa: placa.toUpperCase(),
              role: 'transportista',
              modulo_origen: 'sara_fletes',
              modulos_autorizados: ['sara_fletes']
            }
          }
        });
        if (signUpError) throw signUpError;

        // Iniciar sesión inmediatamente
        await supabase.auth.signInWithPassword({ email, password });
        router.push('/modulos/fletes/mi-perfil');
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Izquierdo: Branding */}
        <div className="w-full md:w-5/12 bg-amber-500 p-10 text-slate-900 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
             <Truck className="w-96 h-96" />
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl mb-12">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Truck className="w-6 h-6 text-amber-500" />
              </div>
              SARA Fletes
            </Link>
            
            <h2 className="text-4xl font-black mb-4 leading-tight">Únete a la Red Logística Más Grande.</h2>
            <p className="font-medium text-amber-900/80 mb-8">
              Recibe viajes directamente a tu celular. Cero intermediarios, tarifas transparentes y pagos seguros.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
              <p className="font-bold">Sube tus documentos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
              <p className="font-bold">Elige tu plan (7%, 15% o 25%)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
              <p className="font-bold">¡Empieza a facturar!</p>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="w-full md:w-7/12 p-10 bg-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold text-slate-800">
              {isLogin ? 'Iniciar Sesión' : 'Registro de Vehículo'}
            </h3>
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setRedirectPortal(null);
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              {isLogin ? 'Crear una cuenta' : 'Ya tengo cuenta'}
            </button>
          </div>

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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Ir a {redirectPortal.name} →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      required 
                      type="text" 
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none" 
                      placeholder="Juan Pérez" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Placa del Vehículo</label>
                  <div className="relative">
                    <Truck className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      required 
                      type="text" 
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none uppercase font-mono" 
                      placeholder="ABC-1234" 
                    />
                  </div>
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none" 
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors"
            >
              {loading ? 'Procesando...' : (isLogin ? 'Ingresar al Radar' : 'Registrar Vehículo y Comenzar')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
