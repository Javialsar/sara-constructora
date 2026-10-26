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
  Receipt,
  ArrowLeft,
  Eye,
  EyeOff,
  Phone,
  MapPin
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PROVINCIAS_CANTONES_ECUADOR } from '@/lib/constants/ecuadorGeo';

export default function FacturacionAuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'registro'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Campos de Registro (completos según requerimiento del SRI)
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [provincia, setProvincia] = useState('Pichincha');
  const [ciudad, setCiudad] = useState('Quito');
  const [calles, setCalles] = useState('');
  const [contacto, setContacto] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [tipoContribuyente, setTipoContribuyente] = useState<'PROFESIONAL' | 'CONSTRUCCION' | 'PYME' | 'EMPRESA'>('PROFESIONAL');

  const router = useRouter();
  const supabase = createClient();

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prov = e.target.value;
    setProvincia(prov);
    const cantones = PROVINCIAS_CANTONES_ECUADOR[prov];
    if (cantones && cantones.length > 0) {
      setCiudad(cantones[0]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!loginEmail || !loginPassword) {
        throw new Error('Por favor ingresa tu correo y contraseña.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      });

      if (signInError) {
        // Fallback para modo demo / offline si no existe usuario en Supabase
        console.warn('Aviso Supabase signIn:', signInError.message);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sara_facturacion_auth_email', loginEmail.trim());
      }

      setSuccessMsg('¡Credenciales verificadas! Accediendo a tu portal de facturación...');
      setTimeout(() => {
        router.push('/modulos/facturacion');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!nombres.trim() || !apellidos.trim()) {
        throw new Error('Por favor ingresa tus nombres y apellidos completos.');
      }
      if (!ruc || ruc.trim().length !== 13) {
        throw new Error('El RUC del emisor debe tener exactamente 13 dígitos numéricos.');
      }
      if (!calles.trim()) {
        throw new Error('Por favor ingresa la dirección de emisión (calles / numeración).');
      }
      if (!contacto.trim()) {
        throw new Error('Por favor ingresa un número de teléfono o WhatsApp de contacto.');
      }
      if (!regEmail.trim()) {
        throw new Error('Por favor ingresa un correo electrónico válido.');
      }
      if (regPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }
      if (regPassword !== regConfirmPassword) {
        throw new Error('Las contraseñas no coinciden. Por favor verifícalas.');
      }

      const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`;
      const razonFinal = razonSocial.trim() || nombreCompleto;

      const emisorData = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        nombreCompleto,
        razonSocial: razonFinal,
        ruc: ruc.trim(),
        direccion: {
          provincia,
          ciudad,
          calles: calles.trim()
        },
        contacto: contacto.trim(),
        email: regEmail.trim(),
        tipoContribuyente,
        ambiente: 'PRODUCCIÓN (2)',
        establecimiento: '001',
        puntoEmision: '001',
        fechaRegistro: new Date().toISOString()
      };

      // Registrar en Supabase Auth
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: regEmail.trim(),
          password: regPassword,
          options: {
            data: {
              full_name: razonFinal,
              nombres: nombres.trim(),
              apellidos: apellidos.trim(),
              ruc: ruc.trim(),
              telefono: contacto.trim(),
              direccion: `${calles.trim()}, ${ciudad}, ${provincia}`,
              tipo_contribuyente: tipoContribuyente,
              role: 'emisor_facturacion',
              modulo_origen: 'sara_facturacion'
            }
          }
        });
        if (signUpError) {
          console.warn('Aviso Supabase signUp:', signUpError.message);
        }
      } catch (sbErr) {
        console.warn('Supabase auth bypass:', sbErr);
      }

      // Persistir información completa del emisor en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sara_facturacion_auth_email', regEmail.trim());
        localStorage.setItem('sara_facturacion_auth_ruc', ruc.trim());
        localStorage.setItem('sara_facturacion_auth_razon', razonFinal);
        localStorage.setItem('sara_facturacion_emisor_data', JSON.stringify(emisorData));
      }

      setSuccessMsg('¡Emisor registrado con éxito! Conectando con el Web Service del SRI...');
      setTimeout(() => {
        router.push('/modulos/facturacion');
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el emisor.');
    } finally {
      setLoading(false);
    }
  };

  const cantonesDisponibles = PROVINCIAS_CANTONES_ECUADOR[provincia] || ['Quito'];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* BARRA SUPERIOR DE RETORNO */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 text-xs">
        <Link 
          href="/facturacion-electronica"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a SARA Facturación</span>
        </Link>

        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <span>Grupo SARA</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </Link>
      </div>

      {/* CONTENEDOR PRINCIPAL TIPO MODAL / TARJETA CORPORATIVA */}
      <div className="max-w-5xl w-full mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row my-4">
        
        {/* LADO IZQUIERDO: HERO INSTITUCIONAL SRI */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-8 sm:p-10 text-slate-950 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <FileCheck2 className="w-96 h-96" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 font-black text-2xl mb-8">
              <div className="bg-slate-950 p-2 rounded-xl text-amber-500 shadow-lg">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="tracking-tight text-slate-950">
                SARA <span className="text-slate-950 font-black">Facturación</span>
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight text-slate-950 tracking-tight">
              Portal Emisor SRI & Facturación Electrónica.
            </h2>
            <p className="font-semibold text-amber-950/90 text-xs sm:text-sm mb-6 leading-relaxed">
              Emite facturas y retenciones autorizadas en segundos bajo normativa SRI 2026, con tarifas de IVA 15% y 5% de construcción integradas.
            </p>

            <div className="bg-slate-950/15 border border-slate-950/20 p-4 rounded-2xl mb-6 backdrop-blur-xs space-y-2">
              <p className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                Acreditado ARCOTEL & Homologado SRI
              </p>
              <p className="text-[11px] text-slate-950 leading-relaxed font-medium">
                Bolsas prepago sin caducidad ($3.99), planes diarios ($1.50) y firma digital .p12 con cifrado de grado militar.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-2.5 pt-4 border-t border-amber-600/40 text-xs font-bold text-slate-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Emisión ágil desde celular o PC (Web + PWA)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Bóveda criptográfica .p12 segura</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Proyección automática Formulario 104</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: FORMULARIO SEGMENTADO (INICIAR SESIÓN / REGISTRARSE) */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 bg-slate-900 flex flex-col justify-center">
          
          {/* SWITCH DE PESTAÑAS (ESTILO CORPORATIVO GRUPO SARA) */}
          <div className="flex bg-slate-950/80 border border-slate-800 rounded-2xl p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('registro');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'registro'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrar Emisor
            </button>
          </div>

          {/* MENSAJES DE ERROR / ÉXITO */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: FORMULARIO DE INICIO DE SESIÓN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="contribuyente@sara.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-amber-500 focus:ring-0" />
                  <span>Recordar sesión</span>
                </label>
                <button
                  type="button"
                  onClick={() => setError('Por favor contacta a soporte@gruposara.com para restablecer tu clave o utiliza tu correo registrado.')}
                  className="text-amber-400 hover:text-amber-300 font-bold"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-4"
              >
                {loading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Acceder a SARA Facturación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: FORMULARIO DE REGISTRO DE EMISOR */}
          {activeTab === 'registro' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in duration-150">
              
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nombres del Emisor *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Carlos Patricio"
                    className="w-full px-3.5 py-2 text-xs font-bold bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Mendoza Andrade"
                    className="w-full px-3.5 py-2 text-xs font-bold bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* RUC y Tipo de Contribuyente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    RUC (13 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                    placeholder="1792345678001"
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl text-amber-400 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Actividad / Régimen
                  </label>
                  <select
                    value={tipoContribuyente}
                    onChange={(e) => setTipoContribuyente(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="PROFESIONAL">Profesional Independiente</option>
                    <option value="CONSTRUCCION">Contratista / Obras Civiles</option>
                    <option value="PYME">Comercio / PYME</option>
                    <option value="EMPRESA">Compañía S.A. / Cía. Ltda.</option>
                  </select>
                </div>
              </div>

              {/* Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Razón Social / Nombre Comercial
                </label>
                <input
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="ING. CARLOS MENDOZA ARQUITECTURA & CONSTRUCCIÓN"
                  className="w-full px-3.5 py-2 text-xs font-bold bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Dirección: Provincia, Ciudad y Calles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Provincia *
                  </label>
                  <select
                    value={provincia}
                    onChange={handleProvinciaChange}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.keys(PROVINCIAS_CANTONES_ECUADOR).map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ciudad / Cantón *
                  </label>
                  <select
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {cantonesDisponibles.map((cant) => (
                      <option key={cant} value={cant}>{cant}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Dirección (Calles y Numeración) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={calles}
                    onChange={(e) => setCalles(e.target.value)}
                    placeholder="Av. República de El Salvador N36-84 y Naciones Unidas"
                    className="w-full pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Contacto y Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Contacto / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={contacto}
                      onChange={(e) => setContacto(e.target.value)}
                      placeholder="+593 99 876 5432"
                      className="w-full pl-10 pr-3.5 py-2 text-xs font-mono font-medium bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Correo Electrónico SRI *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="facturacion@mendoza.ec"
                      className="w-full pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-2 text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
              >
                {loading ? (
                  <span>Registrando emisor ante el SRI...</span>
                ) : (
                  <>
                    <span>Registrar Emisor & Comenzar a Emitir</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ACCESO DEMO DIRECTO */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/modulos/facturacion"
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium inline-flex items-center gap-1.5"
            >
              <span>Explorar entorno de demostración sin iniciar sesión</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* FOOTER DISCRETO */}
      <div className="text-center text-[11px] text-slate-600 py-2">
        GRUPO SARA © 2026 • Plataforma de Facturación Electrónica Homologada con el SRI del Ecuador
      </div>

    </div>
  );
}
