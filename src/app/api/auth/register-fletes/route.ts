import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      nombre,
      telefono,
      userRole = 'transportista',
      placa,
      empresa,
      serviciosHabilitados,
    } = body;

    // 1. Validaciones básicas de integridad
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa tu nombre completo, correo electrónico y contraseña.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    if (userRole === 'transportista' && !placa) {
      return NextResponse.json(
        { success: false, error: 'La placa del vehículo es obligatoria para registrarse como transportista.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombre.trim();
    const cleanPlaca = (placa || '').trim().toUpperCase();
    const cleanEmpresa = (empresa || '').trim();
    // En la base de datos de Supabase, la tabla 'clientes' tiene 'telefono' NOT NULL.
    // Garantizamos siempre un valor válido sin fallos de integridad.
    const cleanTelefono = (telefono || '').trim() || '0990000000';

    // Desglosar nombre y apellido para el trigger handle_new_user() en public.clientes
    const nameParts = cleanNombre.split(/\s+/);
    const primerNombre = nameParts[0] || 'Usuario';
    const primerApellido = nameParts.slice(1).join(' ') || (userRole === 'transportista' ? 'Transportista' : 'Cliente');

    const adminClient = await createSupabaseAdminClient();

    // 2. Crear usuario con confirmación de correo automática en Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password.trim(),
      email_confirm: true,
      app_metadata: {
        role: userRole,
        modulo_origen: 'sara_fletes',
        modulos_autorizados: ['sara_fletes'],
        es_admin: false,
      },
      user_metadata: {
        nombre: primerNombre,
        apellido: primerApellido,
        full_name: cleanNombre,
        telefono: cleanTelefono,
        phone: cleanTelefono,
        placa: userRole === 'transportista' ? cleanPlaca : undefined,
        servicios_habilitados:
          userRole === 'transportista' && Array.isArray(serviciosHabilitados) && serviciosHabilitados.length > 0
            ? serviciosHabilitados.map(String)
            : userRole === 'transportista'
            ? ['viajes', 'mandaditos', 'fletes']
            : undefined,
        empresa: cleanEmpresa || undefined,
        role: userRole,
        rol: userRole,
        modulo_origen: 'sara_fletes',
        modulos_autorizados: ['sara_fletes'],
        created_at: new Date().toISOString(),
      },
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (
        msg.includes('already registered') ||
        msg.includes('already been registered') ||
        msg.includes('unique constraint')
      ) {
        return NextResponse.json(
          { success: false, error: 'Este correo electrónico ya se encuentra registrado. Por favor inicia sesión.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        role: userRole,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al registrar usuario en SARA Fletes';
    console.error('[register-fletes API error]:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
