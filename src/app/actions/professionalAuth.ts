'use server';

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export interface ProfessionalAuthResponse {
  success?: boolean;
  error?: string;
}

/**
 * Iniciar sesión profesional para Ingenieros, Arquitectos y Constructoras
 */
export async function loginProfessionalAction(formData: FormData): Promise<ProfessionalAuthResponse> {
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  if (!email || !password) {
    return { error: 'Por favor ingrese su correo corporativo y contraseña.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciales inválidas o cuenta no registrada.' };
  }

  const meta = data.user?.user_metadata || {};
  const role = meta.role || (meta.es_admin ? 'admin' : '');

  const ALLOWED_ROLES = [
    'admin',
    'superadmin',
    'tecnico',
    'profesional_constructora',
    'cliente_constructora',
    'ingeniero_residente',
    'arquitecto_bim',
    'contratista_general',
  ];

  if (!ALLOWED_ROLES.includes(role) && !meta.modulos_autorizados?.includes('sara_constructora')) {
    await supabase.auth.signOut();
    return {
      error: 'Su cuenta no cuenta con suscripción o credencial profesional activa para SARA-CONSTRUCTORA.',
    };
  }

  redirect('/constructora/suite');
}

/**
 * Registro profesional B2B con validación de RUC, Matrícula Profesional y Tipo de Cliente
 */
export async function registerProfessionalAction(formData: FormData): Promise<ProfessionalAuthResponse> {
  const nombre = (formData.get('nombre') as string)?.trim();
  const apellido = (formData.get('apellido') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const telefono = (formData.get('telefono') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();
  const tipoProfesional = formData.get('tipoProfesional') as 'ingeniero' | 'arquitecto' | 'constructora';
  const identificacionRuc = (formData.get('identificacionRuc') as string)?.trim();
  const registroSenescyt = (formData.get('registroSenescyt') as string)?.trim();
  const razonSocial = (formData.get('razonSocial') as string)?.trim();
  const codigoContratoObra = (formData.get('codigoContratoObra') as string)?.trim();

  if (!nombre || !apellido || !email || !telefono || !password || !tipoProfesional || !identificacionRuc) {
    return { error: 'Por favor complete todos los campos obligatorios del registro profesional.' };
  }

  if (password.length < 8) {
    return { error: 'La contraseña corporativa debe tener al menos 8 caracteres.' };
  }

  // Validar RUC / Cédula básica ecuatoriana (10 o 13 dígitos)
  if (![10, 13].includes(identificacionRuc.length)) {
    return { error: 'La identificación (Cédula o RUC) debe tener 10 o 13 dígitos numéricos.' };
  }

  const roleMap: Record<string, string> = {
    ingeniero: 'ingeniero_residente',
    arquitecto: 'arquitecto_bim',
    constructora: 'contratista_general',
  };

  const selectedRole = roleMap[tipoProfesional] || 'profesional_constructora';

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        apellido,
        full_name: `${nombre} ${apellido}`,
        telefono,
        tipo_profesional: tipoProfesional,
        role: selectedRole,
        identificacion: identificacionRuc,
        ruc: identificacionRuc,
        registro_profesional: registroSenescyt,
        senescyt: registroSenescyt,
        razon_social: razonSocial || `${nombre} ${apellido}`,
        empresa: razonSocial || `${nombre} ${apellido}`,
        codigo_contrato_obra: codigoContratoObra || null,
        modulo_origen: 'sara_constructora',
        modulos_autorizados: ['sara_constructora'],
        status: 'activo',
        created_at: new Date().toISOString(),
      },
    },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'Este correo electrónico profesional ya está registrado en GRUPO SARA.' };
    }
    return { error: `Error en el registro: ${authError.message}` };
  }

  // Si la sesión se inició automáticamente, redirigir
  if (authData.session) {
    redirect('/constructora/suite');
  }

  return { success: true };
}
