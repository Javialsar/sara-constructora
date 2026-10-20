import { NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export interface AuthenticatedProfessional {
  id: string;
  email: string;
  role: string;
  tipoProfesional: 'ingeniero' | 'arquitecto' | 'constructora' | 'master_admin';
  ruc?: string;
  registroProfesional?: string;
  empresa?: string;
  proyectosAutorizados?: string[];
}

/**
 * Autentica y valida que la petición provenga de un cliente profesional verificado
 * (Ingeniero, Arquitecto, Empresa Constructora o Admin)
 */
export async function authenticateProfessionalRequest(
  req: NextRequest
): Promise<{ user: AuthenticatedProfessional | null; error?: string; status?: number }> {
  try {
    // 1. Extraer token Bearer si viene en cabecera Authorization
    const authHeader = req.headers.get('authorization');
    let user = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const adminClient = await createSupabaseAdminClient();
      const { data, error } = await adminClient.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    // 2. Si no hay bearer token, revisar cookie de sesión de Supabase
    if (!user) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    }

    if (!user) {
      return {
        user: null,
        error: 'No autenticado. Inicie sesión en el Portal Profesional de SARA-CONSTRUCTORA.',
        status: 401,
      };
    }

    const appMeta = user.app_metadata || {};
    const userMeta = user.user_metadata || {};
    const meta = { ...userMeta, ...appMeta };
    const role = appMeta.role || userMeta.role || (appMeta.es_admin || userMeta.es_admin ? 'admin' : '');

    // 3. Validar roles autorizados para la Suite de Ingeniería & Construcción
    const ALLOWED_SUITE_ROLES = [
      'admin',
      'superadmin',
      'tecnico',
      'profesional_constructora',
      'cliente_constructora',
      'ingeniero_residente',
      'arquitecto_bim',
      'contratista_general',
      'contador_constructora',
      'bodeguero_constructora',
      'tecnico_apoyo_obra',
    ];

    const modulosAutorizados = appMeta.modulos_autorizados || userMeta.modulos_autorizados || [];
    const hasPermission = ALLOWED_SUITE_ROLES.includes(role) || modulosAutorizados.includes('sara_constructora');

    if (!hasPermission) {
      return {
        user: null,
        error: 'Acceso Denegado. Se requiere credencial profesional validada (Ingeniero, Arquitecto o Constructora con contrato activo).',
        status: 403,
      };
    }

    const professional: AuthenticatedProfessional = {
      id: user.id,
      email: user.email || '',
      role: role,
      tipoProfesional: meta.tipo_profesional || (role === 'admin' ? 'master_admin' : 'constructora'),
      ruc: meta.ruc || meta.identificacion,
      registroProfesional: meta.registro_profesional || meta.senescyt,
      empresa: meta.razon_social || meta.empresa,
      proyectosAutorizados: appMeta.proyectos_autorizados || userMeta.proyectos_autorizados || [],
    };

    return { user: professional };
  } catch (err: any) {
    return {
      user: null,
      error: `Error verificando autenticación: ${err.message || 'Error desconocido'}`,
      status: 500,
    };
  }
}
