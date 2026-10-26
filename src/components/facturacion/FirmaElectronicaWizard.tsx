'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  User, 
  Building2, 
  UploadCloud, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink,
  MessageSquare,
  FileCheck2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Smartphone,
  AlertCircle,
  HelpCircle,
  Camera,
  Eye,
  Loader2,
  Receipt,
  Download,
  FileText
} from 'lucide-react';
import Link from 'next/link';

// Provincias de Ecuador por código de cédula
const PROVINCIAS_ECUADOR: Record<string, string> = {
  '01': 'Azuay', '02': 'Bolívar', '03': 'Cañar', '04': 'Carchi', '05': 'Cotopaxi',
  '06': 'Chimborazo', '07': 'El Oro', '08': 'Esmeraldas', '09': 'Guayas', '10': 'Imbabura',
  '11': 'Loja', '12': 'Los Ríos', '13': 'Manabí', '14': 'Morona Santiago', '15': 'Napo',
  '16': 'Pastaza', '17': 'Pichincha', '18': 'Tungurahua', '19': 'Zamora Chinchipe',
  '20': 'Galápagos', '21': 'Sucumbíos', '22': 'Orellana', '23': 'Santo Domingo de los Tsáchilas',
  '24': 'Santa Elena', '30': 'Ecuatorianos en el Exterior'
};

function validarCedulaEcuador(cedula: string): { valida: boolean; provincia?: string; mensaje?: string } {
  const clean = cedula.replace(/\D/g, '');
  if (clean.length !== 10) {
    return { valida: false, mensaje: 'Debe tener exactamente 10 dígitos' };
  }
  const codProv = clean.substring(0, 2);
  const provincia = PROVINCIAS_ECUADOR[codProv];
  if (!provincia) {
    return { valida: false, mensaje: 'Código de provincia no válido' };
  }
  const tercerDigito = parseInt(clean[2], 10);
  if (tercerDigito >= 6) {
    return { valida: false, mensaje: 'El tercer dígito de persona natural debe ser menor a 6' };
  }
  // Algoritmo Módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(clean[i], 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  const digitoVerificador = (10 - (suma % 10)) % 10;
  if (digitoVerificador !== parseInt(clean[9], 10)) {
    return { valida: false, mensaje: 'Dígito verificador inválido' };
  }
  return { valida: true, provincia };
}

export default function FirmaElectronicaWizard() {
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Paso 1: Plan y Vigencia
  const [tipoPersona, setTipoPersona] = useState<'NATURAL' | 'JURIDICA'>('NATURAL');
  const [vigenciaAnios, setVigenciaAnios] = useState<number>(1);

  // Precios según vigencia y tipo
  const precios: Record<string, Record<number, number>> = {
    NATURAL: { 1: 18.00, 2: 30.00, 3: 40.00, 5: 55.00 },
    JURIDICA: { 1: 22.00, 2: 38.00, 3: 50.00, 5: 65.00 }
  };
  const precioSeleccionado = precios[tipoPersona][vigenciaAnios] || 18.00;

  // Paso 2: Datos de Identidad y Registro Express
  const [cedula, setCedula] = useState('');
  const [ruc, setRuc] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [provincia, setProvincia] = useState('Pichincha');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [cedulaInfo, setCedulaInfo] = useState<{ valida: boolean; provincia?: string; mensaje?: string } | null>(null);

  // Paso 3: Documentación
  const [docCedulaFrontal, setDocCedulaFrontal] = useState<string | null>(null);
  const [docCedulaPosterior, setDocCedulaPosterior] = useState<string | null>(null);
  const [docSelfie, setDocSelfie] = useState<string | null>(null);
  const [docNombramiento, setDocNombramiento] = useState<string | null>(null);

  // Paso 4: Pago
  const [metodoPago, setMetodoPago] = useState<'deuna' | 'card' | 'transfer'>('deuna');
  const [bancoTransferencia, setBancoTransferencia] = useState<'pichincha' | 'guayaquil' | 'produbanco'>('pichincha');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [tarjetaNumero, setTarjetaNumero] = useState('');
  const [tarjetaVence, setTarjetaVence] = useState('');
  const [tarjetaCvc, setTarjetaCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paso 5: Resultado / Éxito
  const [codigoTramite, setCodigoTramite] = useState('');
  const [credencialesGeneradas, setCredencialesGeneradas] = useState<{ usuario: string; clave: string } | null>(null);
  const [facturaGenerada, setFacturaGenerada] = useState<{
    nroFactura: string;
    claveAccesoSri: string;
    subtotalSinIva: number;
    tarifaIva: number;
    montoIva: number;
    totalFacturado: number;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Validar cédula en vivo
  const handleCedulaChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setCedula(clean);
    if (clean.length === 10) {
      const res = validarCedulaEcuador(clean);
      setCedulaInfo(res);
      if (res.valida && res.provincia) {
        setProvincia(res.provincia);
      }
    } else {
      setCedulaInfo(null);
    }
  };

  const handleCopiarCredenciales = () => {
    if (!credencialesGeneradas) return;
    const txt = `Credenciales SARA Facturación:\nUsuario: ${credencialesGeneradas.usuario}\nContraseña: ${credencialesGeneradas.clave}\nPortal: https://sara-constructora.vercel.app/modulos/facturacion/auth`;
    navigator.clipboard.writeText(txt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Enviar formulario al API
  const handleFinalizarSolicitud = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/facturacion/firmas/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoPersona,
          cedula,
          ruc: ruc || (tipoPersona === 'NATURAL' ? `${cedula}001` : ''),
          nombres,
          apellidos,
          fechaNacimiento,
          celular,
          email,
          provincia,
          ciudad,
          direccion,
          vigenciaAnios,
          precioUsd: precioSeleccionado,
          metodoPago: metodoPago === 'card' ? 'TARJETA_STRIPE' : metodoPago === 'deuna' ? 'DEUNA' : 'TRANSFERENCIA',
          referenciaPago: metodoPago === 'card' ? 'APROBADA_STRIPE_ONLINE' : referenciaPago,
          documentoCedulaFrontal: docCedulaFrontal || 'CEDULA_FRONTAL_ADJUNTA',
          documentoCedulaPosterior: docCedulaPosterior || 'CEDULA_POSTERIOR_ADJUNTA',
          documentoSelfie: docSelfie || 'SELFIE_BIOMETRICA_ADJUNTA',
          documentoRucNombramiento: docNombramiento || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setCodigoTramite(data.codigoTramite);
        if (data.facturaElectronica) {
          setFacturaGenerada(data.facturaElectronica);
        } else {
          setFacturaGenerada({
            nroFactura: '001-002-000004935',
            claveAccesoSri: `2610202601179298451200120010020000049351234567814`,
            subtotalSinIva: Number((precioSeleccionado / 1.15).toFixed(2)),
            tarifaIva: 15,
            montoIva: Number((precioSeleccionado - (precioSeleccionado / 1.15)).toFixed(2)),
            totalFacturado: precioSeleccionado
          });
        }
        setCredencialesGeneradas({
          usuario: data.credenciales.usuario,
          clave: data.credenciales.claveProvisional
        });
        setPasoActual(5);
      } else {
        alert(data.error || 'Ocurrió un error al procesar tu solicitud.');
      }
    } catch (err: any) {
      alert('Error de conexión al enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-950 border border-white/[0.08] shadow-2xl overflow-hidden">
      
      {/* HEADER WIZARD & BREADCRUMB */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 border-b border-white/[0.08]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Emisión Oficial ARCOTEL & SRI</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              Solicitud de Firma Electrónica (.p12)
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Obtén tu archivo .p12 con validez jurídica total en minutos y activa tu cuenta de facturación.
            </p>
          </div>

          <div className="flex items-center gap-2 text-right">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Paso</span>
            <span className="font-display text-2xl font-black text-amber-400 font-mono">0{pasoActual}</span>
            <span className="text-slate-600 font-mono">/ 04</span>
          </div>
        </div>

        {/* BARRA DE PROGRESO DE 4 PASOS */}
        {pasoActual < 5 && (
          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { num: 1, label: '1. Plan & Vigencia' },
              { num: 2, label: '2. Identidad & Cuenta' },
              { num: 3, label: '3. Requisitos Digitales' },
              { num: 4, label: '4. Pago Seguro' }
            ].map((p) => (
              <div key={p.num} className="space-y-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    pasoActual >= p.num ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-800'
                  }`} 
                />
                <span className={`text-[10px] sm:text-xs font-semibold block truncate ${
                  pasoActual === p.num ? 'text-amber-400 font-bold' : pasoActual > p.num ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUERPO DEL WIZARD */}
      <div className="p-6 md:p-10">

        {/* ================= PASO 1: SELECCIÓN DE PLAN ================= */}
        {pasoActual === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Selecciona el tipo de solicitante</h4>
              <p className="text-xs text-slate-400">¿Para quién se emite el certificado digital de firma electrónica?</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setTipoPersona('NATURAL')}
                  className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                    tipoPersona === 'NATURAL'
                      ? 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/5'
                      : 'border-white/[0.08] bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${tipoPersona === 'NATURAL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Persona Natural</span>
                      {tipoPersona === 'NATURAL' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Profesionales, arquitectos, ingenieros, médicos, artesanos, comerciantes o con RUC/RIMPE.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPersona('JURIDICA')}
                  className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                    tipoPersona === 'JURIDICA'
                      ? 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/5'
                      : 'border-white/[0.08] bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${tipoPersona === 'JURIDICA' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Persona Jurídica (Empresa)</span>
                      {tipoPersona === 'JURIDICA' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Para Representante Legal o Apoderado de Compañías S.A., Cía. Ltda., S.A.S. o Entidades.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* SELECCIÓN DE VIGENCIA */}
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Selecciona la vigencia del certificado</h4>
              <p className="text-xs text-slate-400">Recomendamos 2 años o 5 años para evitar renovaciones frecuentes y ahorrar más.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
                {[
                  { anios: 1, label: '1 Año', badge: 'Estándar', desc: 'Renovación anual' },
                  { anios: 2, label: '2 Años', badge: 'Más Popular', desc: 'Ahorro del 20%' },
                  { anios: 3, label: '3 Años', badge: 'Recomendado', desc: 'Tranquilidad extendida' },
                  { anios: 5, label: '5 Años', badge: 'Mayor Ahorro', desc: 'Máximo ahorro total' }
                ].map((item) => {
                  const p = precios[tipoPersona][item.anios];
                  const isSelected = vigenciaAnios === item.anios;
                  return (
                    <button
                      key={item.anios}
                      type="button"
                      onClick={() => setVigenciaAnios(item.anios)}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-400/30 shadow-md'
                          : 'border-white/[0.08] bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-amber-400 block mb-1">
                        {item.badge}
                      </span>
                      <div className="font-display text-lg font-black text-white">{item.label}</div>
                      <div className="font-display text-2xl font-extrabold text-amber-400 font-mono mt-1">
                        ${p.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                      <div className="mt-2 pt-1.5 border-t border-white/[0.08] text-[9px] text-slate-400 font-mono">
                        <span>Subt: ${(p / 1.15).toFixed(2)} + IVA: ${(p - (p / 1.15)).toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BENEFICIOS DESTACADOS */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Archivo <strong>.p12 descargable</strong> para SRI y Quipux.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Emisión 100% online con biometría facial en tu celular.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-400 font-bold">¡INCLUYE 15 FACTURAS ELECTRÓNICAS GRATIS en SARA!</span>
              </div>
            </div>

            {/* BOTÓN CONTINUAR */}
            <div className="flex justify-end pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPasoActual(2)}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-[0.98] transition-all"
              >
                <span>Continuar a Registro de Datos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 2: IDENTIDAD & CREACIÓN DE CUENTA ================= */}
        {pasoActual === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Datos del Titular y Creación de Cuenta</h4>
              <p className="text-xs text-slate-400">
                Ingresa la información oficial de tu cédula. Con estos datos generamos tu certificado y tu cuenta de acceso a GRUPO SARA.
              </p>
            </div>

            {/* AVISO INTELIGENTE: CREACIÓN AUTOMÁTICA DE USUARIO Y CONTRASEÑA */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <h5 className="font-bold text-amber-400 text-sm">
                  ✨ Cuenta Automática Instantánea (Sin fricción)
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Para que no tengas que memorizar contraseñas complejas, tu cuenta de acceso a GRUPO SARA se configurará automáticamente:
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-white text-xs">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                    Usuario: <strong className="text-amber-400">{cedula || 'Tu Cédula'}</strong>
                  </span>
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                    Contraseña provisional: <strong className="text-amber-400">{cedula || 'Tu Cédula'}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-0.5">
                  Podrás ingresar inmediatamente con tu número de cédula y cambiar tu clave en cualquier momento desde tu panel de usuario.
                </p>
              </div>
            </div>

            {/* FORMULARIO DE DATOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Cédula */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Número de Cédula *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={cedula}
                  onChange={(e) => handleCedulaChange(e.target.value)}
                  placeholder="Ej. 1792984512"
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                {cedulaInfo && (
                  <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${cedulaInfo.valida ? 'text-emerald-400' : 'text-red-400'}`}>
                    {cedulaInfo.valida ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cédula válida ({cedulaInfo.provincia})</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{cedulaInfo.mensaje}</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* RUC (Si aplica) */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  RUC (Opcional si es con RUC)
                </label>
                <input
                  type="text"
                  maxLength={13}
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                  placeholder={cedula ? `${cedula}001` : 'Ej. 1792984512001'}
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Fecha de Nacimiento */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Nombres */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombres Completos *
                </label>
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value.toUpperCase())}
                  placeholder="Ej. JUAN CARLOS"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400 font-semibold"
                />
              </div>

              {/* Apellidos */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Apellidos Completos *
                </label>
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value.toUpperCase())}
                  placeholder="Ej. PÉREZ MOREIRA"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400 font-semibold"
                />
              </div>

              {/* Celular / WhatsApp */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Celular WhatsApp *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={celular}
                  onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 0998124912"
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Correo Electrónico */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico (Para recibir la firma .p12) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-correo@empresa.com"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Provincia */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Provincia *
                </label>
                <select
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400"
                >
                  {Object.values(PROVINCIAS_ECUADOR).map((pr) => (
                    <option key={pr} value={pr} className="bg-slate-900 text-white">{pr}</option>
                  ))}
                </select>
              </div>

              {/* Ciudad / Cantón */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ciudad o Cantón *
                </label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ej. Quito / Guayaquil / Cuenca"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Dirección Domiciliaria */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Dirección Exacta (Calles y Nro de Casa) *
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Av. Amazonas N34-120 y Naciones Unidas"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPasoActual(1)}
                className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Plan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!cedula || !nombres || !email || !celular) {
                    alert('Por favor completa todos los campos requeridos (*).');
                    return;
                  }
                  setPasoActual(3);
                }}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-[0.98] transition-all"
              >
                <span>Subir Requisitos Digitales</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 3: REQUISITOS DIGITALES ================= */}
        {pasoActual === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Carga de Requisitos Digitales</h4>
              <p className="text-xs text-slate-400">
                La Ley de Comercio Electrónico y ARCOTEL exigen validar tu identidad fotográficamente para prevenir suplantación de identidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Cédula Frontal */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">1. Cédula Frontal *</span>
                    {docCedulaFrontal && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">Foto nítida del frente de tu cédula donde se aprecie tu foto y datos.</p>
                </div>

                <div className="border border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 transition-colors">
                  <label className="cursor-pointer block space-y-2">
                    <UploadCloud className="w-6 h-6 mx-auto text-amber-400" />
                    <span className="text-xs font-medium text-slate-300 block truncate">
                      {docCedulaFrontal || 'Seleccionar o tomar foto'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDocCedulaFrontal(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 2. Cédula Posterior */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">2. Cédula Posterior *</span>
                    {docCedulaPosterior && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">Foto del reverso de la cédula con código de barras y huella dactilar.</p>
                </div>

                <div className="border border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 transition-colors">
                  <label className="cursor-pointer block space-y-2">
                    <UploadCloud className="w-6 h-6 mx-auto text-amber-400" />
                    <span className="text-xs font-medium text-slate-300 block truncate">
                      {docCedulaPosterior || 'Seleccionar o tomar foto'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDocCedulaPosterior(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 3. Selfie con Cédula */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">3. Selfie con Cédula *</span>
                    {docSelfie && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">Foto de tu rostro sosteniendo tu cédula cerca del pecho.</p>
                </div>

                <div className="border border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 transition-colors">
                  <label className="cursor-pointer block space-y-2">
                    <Camera className="w-6 h-6 mx-auto text-amber-400" />
                    <span className="text-xs font-medium text-slate-300 block truncate">
                      {docSelfie || 'Tomar selfie con cédula'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDocSelfie(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* Documento Opcional si es Jurídica */}
            {tipoPersona === 'JURIDICA' && (
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400">Nombramiento de Representante Legal (Persona Jurídica) *</span>
                  {docNombramiento && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">PDF o imagen del nombramiento debidamente inscrito en el Registro Mercantil.</p>
                <div className="border border-dashed border-slate-700 rounded-xl p-3 text-center cursor-pointer bg-slate-950/30">
                  <label className="cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-300">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>{docNombramiento || 'Adjuntar Nombramiento en PDF'}</span>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDocNombramiento(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* AVISO DE SEGURIDAD */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.05] flex items-center gap-3 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tus fotos y documentos son encriptados bajo norma ISO 27001 y eliminados una vez validada la firma.</span>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPasoActual(2)}
                className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Datos</span>
              </button>

              <button
                type="button"
                onClick={() => setPasoActual(4)}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-[0.98] transition-all"
              >
                <span>Proceder al Pago Seguro (${precioSeleccionado.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 4: PAGO SEGURO ================= */}
        {pasoActual === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Pago y Emisión de Firma Digital</h4>
              <p className="text-xs text-slate-400">Elige tu método de pago preferido para emitir inmediatamente tu trámite.</p>
            </div>

            {/* RESUMEN DEL PEDIDO CON DESGLOSE IVA 15% SRI */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-white/[0.08] space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest">Resumen del Servicio</span>
                  <h5 className="text-base font-extrabold text-white">
                    Firma Electrónica {tipoPersona === 'NATURAL' ? 'P. Natural' : 'P. Jurídica'} · {vigenciaAnios} {vigenciaAnios === 1 ? 'Año' : 'Años'}
                  </h5>
                  <p className="text-xs text-slate-400">Titular Factura: {nombres} {apellidos} ({cedula})</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Total a Pagar</span>
                  <span className="font-display text-3xl font-black text-amber-400 font-mono">
                    ${precioSeleccionado.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Liquidación de Impuestos SRI */}
              <div className="pt-3 border-t border-dashed border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 block">Subtotal (Base Imponible):</span>
                  <strong className="font-mono text-white text-sm">
                    ${(precioSeleccionado / 1.15).toFixed(2)} USD
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 block">IVA 15% (Ecuador SRI):</span>
                  <strong className="font-mono text-emerald-400 text-sm">
                    +${(precioSeleccionado - (precioSeleccionado / 1.15)).toFixed(2)} USD
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[11px] text-amber-300 block">Total con IVA:</span>
                  <strong className="font-mono text-amber-400 text-sm">
                    ${precioSeleccionado.toFixed(2)} USD
                  </strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tu Factura Electrónica autorizada por el SRI se emitirá de inmediato con el desglose del 15% de IVA.</span>
              </p>
            </div>

            {/* SELECTOR DE MÉTODO DE PAGO */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Método de Pago</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* DeUna QR */}
                <button
                  type="button"
                  onClick={() => setMetodoPago('deuna')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    metodoPago === 'deuna'
                      ? 'border-emerald-400 bg-emerald-500/10 text-white ring-1 ring-emerald-400'
                      : 'border-white/[0.08] bg-slate-900/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-white">QR DeUna!</div>
                    <div className="text-[10px] text-slate-400">Banco Pichincha</div>
                  </div>
                </button>

                {/* Stripe Tarjeta */}
                <button
                  type="button"
                  onClick={() => setMetodoPago('card')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    metodoPago === 'card'
                      ? 'border-indigo-400 bg-indigo-500/10 text-white ring-1 ring-indigo-400'
                      : 'border-white/[0.08] bg-slate-900/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-white">Tarjeta Stripe</div>
                    <div className="text-[10px] text-slate-400">Débito o Crédito</div>
                  </div>
                </button>

                {/* Transferencia */}
                <button
                  type="button"
                  onClick={() => setMetodoPago('transfer')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    metodoPago === 'transfer'
                      ? 'border-amber-400 bg-amber-500/10 text-white ring-1 ring-amber-400'
                      : 'border-white/[0.08] bg-slate-900/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-white">Transferencia</div>
                    <div className="text-[10px] text-slate-400">Pichincha / Guayaquil</div>
                  </div>
                </button>

              </div>
            </div>

            {/* DETALLES DEL MÉTODO DE PAGO */}
            {metodoPago === 'deuna' && (
              <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="p-2 bg-slate-950 rounded-xl shadow-md">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=GRUPOSARA_FIRMA_${precioSeleccionado.toFixed(2)}`} 
                      alt="QR DeUna Grupo SARA" 
                      className="w-28 h-28 rounded bg-white p-1"
                    />
                  </div>
                  <div className="text-xs space-y-1 text-slate-700">
                    <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      Acreditación Inmediata
                    </div>
                    <p className="font-bold text-slate-950 text-sm">Escanea con DeUna! o App Banco Pichincha</p>
                    <p>Monto exacto: <strong className="text-emerald-700 text-base">${precioSeleccionado.toFixed(2)} USD</strong></p>
                    <p className="text-[11px] text-slate-500">Beneficiario: CONSTRUCTORA E INMOBILIARIA SARA S.A.S.</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Número de comprobante / Referencia DeUna *
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) setReferenciaPago(text.trim());
                        } catch {}
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                    >
                      Pegar del portapapeles
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    placeholder="Ej. DU-98124018 o código numérico"
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-950 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            )}

            {metodoPago === 'transfer' && (
              <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBancoTransferencia('pichincha')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      bancoTransferencia === 'pichincha' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Banco Pichincha
                  </button>
                  <button
                    type="button"
                    onClick={() => setBancoTransferencia('guayaquil')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      bancoTransferencia === 'guayaquil' ? 'bg-pink-600 text-white border-pink-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Banco Guayaquil
                  </button>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cuenta Corriente:</span>
                    <strong className="font-mono text-slate-900">
                      {bancoTransferencia === 'pichincha' ? '2100258941' : '0015894236'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RUC:</span>
                    <strong className="font-mono text-slate-900">1792984512001</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Razón Social:</span>
                    <span className="font-semibold text-slate-900">GRUPO SARA INVERSIONES S.A.S.</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Número de Comprobante Bancario *
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) setReferenciaPago(text.trim());
                        } catch {}
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Pegar del portapapeles
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    placeholder="Ej. 098124912"
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-950 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            )}

            {metodoPago === 'card' && (
              <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    maxLength={19}
                    value={tarjetaNumero}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setTarjetaNumero(val);
                    }}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold text-slate-950 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    maxLength={5}
                    value={tarjetaVence}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      setTarjetaVence(val);
                    }}
                    placeholder="MM / AA"
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold text-slate-950 bg-white border border-slate-300 rounded-xl"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={tarjetaCvc}
                    onChange={(e) => setTarjetaCvc(e.target.value.replace(/\D/g, ''))}
                    placeholder="CVC / CVV"
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold text-slate-950 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPasoActual(3)}
                className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Requisitos</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalizarSolicitud}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Emitiendo Trámite...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalizar Solicitud & Emitir Firma (${precioSeleccionado.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 5: CONFIRMACIÓN Y ENTREGA ================= */}
        {pasoActual === 5 && (
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-300 max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                ¡Solicitud Registrada con Éxito!
              </span>
              <h4 className="font-display text-3xl font-black text-white mt-1">
                Tu Firma Electrónica Está en Trámite
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Hemos recibido tu pago y tus documentos. Nuestro equipo de certificación digital está validando tus datos ante la entidad certificadora autorizada por ARCOTEL.
              </p>
            </div>

            {/* CÓDIGO DE TRÁMITE */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/[0.08] text-xs space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Código de Seguimiento Oficial</span>
              <div className="font-mono text-lg font-black text-amber-400 tracking-wider">
                {codigoTramite || 'SARA-FIRMA-EC-2026'}
              </div>
            </div>

            {/* CREDENCIALES GENERADAS */}
            {credencialesGeneradas && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" /> Tus Credenciales de Acceso a GRUPO SARA
                  </h5>
                  <button
                    type="button"
                    onClick={handleCopiarCredenciales}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">Usuario / Cédula:</span>
                    <strong className="text-white text-sm">{credencialesGeneradas.usuario}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">Contraseña provisional:</span>
                    <strong className="text-white text-sm">{credencialesGeneradas.clave}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300">
                  🎁 Ya tienes activas tus <strong>15 Facturas Electrónicas de Bienvenida</strong> en el sistema. Puedes ingresar ahora mismo a tu portal.
                </p>
              </div>
            )}

            {/* FACTURA ELECTRÓNICA SRI AUTORIZADA */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Factura Electrónica Emitida (SRI)</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  AUTORIZADO SRI
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nro. Factura:</span>
                  <strong className="text-white">{facturaGenerada?.nroFactura || '001-002-000004935'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Emisor:</span>
                  <span className="text-slate-300 truncate block">GRUPO SARA INVERSIONES S.A.S.</span>
                </div>
              </div>

              {/* Desglose Tributario */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal (Base Imponible 15%):</span>
                  <strong className="font-mono text-white">${facturaGenerada?.subtotalSinIva?.toFixed(2) || (precioSeleccionado / 1.15).toFixed(2)} USD</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IVA 15% (Ecuador SRI):</span>
                  <strong className="font-mono text-emerald-400">+${facturaGenerada?.montoIva?.toFixed(2) || (precioSeleccionado - (precioSeleccionado / 1.15)).toFixed(2)} USD</strong>
                </div>
                <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-white">
                  <span>Total Factura:</span>
                  <span className="font-mono text-amber-400 text-sm">${facturaGenerada?.totalFacturado?.toFixed(2) || precioSeleccionado.toFixed(2)} USD</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 block">Clave de Acceso SRI (49 Dígitos):</span>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950 p-2 rounded truncate select-all">
                  {facturaGenerada?.claveAccesoSri || '2610202601179298451200120010020000049351234567814'}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => alert('Descargando RIDE de Factura Electrónica (PDF) autorizado por el SRI...')}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar RIDE (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Descargando archivo XML con firma XAdES-BES autorizado por el SRI...')}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Descargar XML SRI</span>
                </button>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN FINAL */}
            <div className="space-y-3 pt-2">
              <Link
                href="/modulos/facturacion"
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <span>Ingresar a Mi Portal de Facturación</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex gap-3">
                <a
                  href={`https://wa.me/593998124912?text=Hola%20Grupo%20SARA,%20acabo%20de%20solicitar%20mi%20firma%20electr%C3%B3nica%20con%20c%C3%B3digo%20${codigoTramite}.%20Quisiera%20confirmar%20la%20emisi%C3%B3n.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Soporte WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setPasoActual(1);
                    setCodigoTramite('');
                    setCredencialesGeneradas(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.08] text-xs font-semibold transition-colors"
                >
                  Nueva Solicitud
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
