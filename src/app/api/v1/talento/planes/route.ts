import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PLANES_TALENTO_DEFAULT, TalentoPlan } from '@/lib/services/talentoPlanesService';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Obtiene la lista de planes de colocación de talento humano
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: true, planes: PLANES_TALENTO_DEFAULT });
  }

  try {
    const { data, error } = await supabase
      .from('parametros_globales')
      .select('id, indirectos_default')
      .limit(1)
      .single();

    if (!error && data?.indirectos_default?.talento_planes) {
      return NextResponse.json({
        success: true,
        planes: data.indirectos_default.talento_planes
      });
    }
  } catch (err: any) {
    console.warn('Error leyendo planes de talento en Supabase:', err.message);
  }

  return NextResponse.json({ success: true, planes: PLANES_TALENTO_DEFAULT });
}

// POST: Actualiza los planes en Supabase (Solo Administrador)
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Credenciales de base de datos no disponibles' }, { status: 500 });
  }

  try {
    // Verificación de Sesión de Administrador
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado. Se requiere sesión de administrador.' }, { status: 401 });
    }
    const role = user.app_metadata?.role || user.user_metadata?.role || '';
    const isAdmin = Boolean(user.app_metadata?.es_admin || user.user_metadata?.es_admin || role === 'admin' || role === 'superadmin' || role === 'tecnico');
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador.' }, { status: 403 });
    }

    const { planes } = await req.json();
    if (!Array.isArray(planes) || planes.length === 0) {
      return NextResponse.json({ success: false, error: 'Formato de planes inválido' }, { status: 400 });
    }

    const { data: globalParam, error: fetchErr } = await supabase
      .from('parametros_globales')
      .select('id, indirectos_default')
      .limit(1)
      .single();

    if (fetchErr || !globalParam?.id) {
      return NextResponse.json({ success: false, error: 'Registro parametros_globales no encontrado' }, { status: 404 });
    }

    const indirectos = globalParam.indirectos_default || {};
    const updatedIndirectos = {
      ...indirectos,
      talento_planes: planes
    };

    const { error: updateErr } = await supabase
      .from('parametros_globales')
      .update({
        indirectos_default: updatedIndirectos,
        updated_at: new Date().toISOString()
      })
      .eq('id', globalParam.id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Planes de colocación de talento humano sincronizados con éxito en Supabase',
      planes
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
