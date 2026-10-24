import { NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '../supabase-server';

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
 * (Ingeniero, Arquitecto, Empresa Constructora, Finanzas, Compras o Admin)
 * mediante Supabase Auth (Bearer Token o Cookie de Sesión SSR).
 */
export async function authenticateProfessionalRequest(
  req: NextRequest | Request
): Promise<{ user: AuthenticatedProfessional | null; error?: string; status?: number }> {
  try {
    // 1. Extraer token Bearer si viene en cabecera Authorization
    const authHeader = req.headers.get('authorization');
    let user: any = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (!token || token === 'undefined' || token === 'null') {
        return {
          user: null,
          error: 'No autorizado: Token Bearer vacío o malformado.',
          status: 401,
        };
      }

      try {
        const adminClient = await createSupabaseAdminClient();
        const { data, error } = await adminClient.auth.getUser(token);
        if (!error && data?.user) {
          user = data.user;
        } else {
          // Token explícitamente inválido o expirado
          return {
            user: null,
            error: 'No autorizado: Token de autenticación inválido o expirado.',
            status: 401,
          };
        }
      } catch {
        return {
          user: null,
          error: 'No autorizado: Error validando credenciales de acceso.',
          status: 401,
        };
      }
    }

    // 2. Si no hay bearer token, revisar cookie de sesión de Supabase
    if (!user) {
      try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          user = data.user;
        }
      } catch {
        // Ignorar si se ejecuta fuera del scope de Next.js cookies o no hay cookies disponibles
      }
    }

    if (!user) {
      return {
        user: null,
        error: 'No autenticado: Se requiere una sesión activa o un Bearer Token válido en Supabase Auth.',
        status: 401,
      };
    }

    const appMeta = user.app_metadata || {};
    const userMeta = user.user_metadata || {};
    const meta = { ...userMeta, ...appMeta };
    const role = String(appMeta.role || userMeta.role || (appMeta.es_admin || userMeta.es_admin ? 'admin' : ''));

    // 3. Validar roles autorizados para la Suite de Operaciones, Finanzas y Construcción
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
      'director_financiero',
      'gerente_financiero',
      'tesorero',
      'jefe_compras',
      'compras',
      'bodeguero_constructora',
      'fiscalizador',
      'tecnico_apoyo_obra',
    ];

    const modulosAutorizados = (appMeta.modulos_autorizados || userMeta.modulos_autorizados || []) as string[];
    const hasPermission =
      ALLOWED_SUITE_ROLES.includes(role) ||
      modulosAutorizados.includes('sara_constructora') ||
      modulosAutorizados.includes('sara_financiero') ||
      modulosAutorizados.includes('sara_compras');

    if (!hasPermission) {
      return {
        user: null,
        error: 'Acceso Denegado: Se requiere credencial profesional validada con permisos sobre este módulo.',
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
      error: `Error de autenticación Zero-Trust: ${err?.message || 'No autorizado'}`,
      status: 401,
    };
  }
}
