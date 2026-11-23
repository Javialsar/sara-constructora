import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      nombre,
      placa,
      empresa,
      telefono,
      userRole = 'transportista',
    } = body;

    // Validación básica de campos obligatorios
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { success: false, error: 'Por favor completa todos los campos obligatorios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const isTransportista = userRole === 'transportista';

    if (isTransportista && (!placa || placa.trim().length < 3)) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa una placa vehicular válida (ej. LBA-1234).' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombre.trim();
    const cleanPlaca = placa ? placa.trim().toUpperCase() : undefined;
    const cleanEmpresa = empresa ? empresa.trim() : undefined;
    const cleanPhone = telefono && telefono.trim().length >= 7 ? telefono.trim() : '0990000000';

    // Desglosar nombre en componentes para compatibilidad con la tabla clientes
    const nameParts = cleanNombre.split(/\s+/);
    const nombrePart = nameParts[0] || 'Usuario';
    const apellidoPart = nameParts.slice(1).join(' ') || (isTransportista ? 'Transportista' : 'Cliente');

    const adminClient = await createSupabaseAdminClient();

    // 1. Crear usuario en auth.users con confirmación automática inmediata
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password.trim(),
      email_confirm: true,
      app_metadata: {
        role: userRole,
        modulo_origen: 'sara_fletes',
        modulos_autorizados: ['sara_fletes'],
        placa: cleanPlaca,
        status: 'activo',
        es_admin: false,
      },
      user_metadata: {
        nombre: nombrePart,
        apellido: apellidoPart,
        full_name: cleanNombre,
        telefono: cleanPhone,
        phone: cleanPhone,
        placa: cleanPlaca,
        empresa: cleanEmpresa,
        role: userRole,
        modulo_origen: 'sara_fletes',
        modulos_autorizados: ['sara_fletes'],
        status: 'activo',
        created_at: new Date().toISOString(),
      },
    });

    if (authError) {
      let msg = authError.message;
      if (
        msg.includes('already been registered') ||
        msg.includes('already registered') ||
        msg.includes('email_exists')
      ) {
        msg = 'Este correo electrónico ya está registrado en SARA. Por favor inicia sesión con tu contraseña.';
      }
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'No se pudo crear la cuenta de usuario en SARA Fletes.' },
        { status: 500 }
      );
    }

    // 2. Garantizar perfil extendido en la tabla pública clientes (idempotente)
    const { error: dbError } = await adminClient.from('clientes').upsert(
      {
        id: authData.user.id,
        nombre: nombrePart,
        apellido: apellidoPart,
        email: cleanEmail,
        telefono: cleanPhone,
        es_admin: false,
        estado: 'activo',
      },
      { onConflict: 'id' }
    );

    if (dbError) {
      console.warn('Nota: Inserción auxiliar en clientes reportó:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: userRole,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al registrar usuario en Fletes.';
    console.error('[/api/auth/register-fletes error]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
