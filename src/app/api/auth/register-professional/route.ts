import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      fullName,
      phone,
      tipoProfesional,
      identificacionRuc,
      registroSenescyt,
      razonSocial,
      codigoContratoObra,
    } = body;

    if (!email || !password || !fullName || !tipoProfesional || !identificacionRuc) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos obligatorios deben ser completados.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La contraseña corporativa debe tener al menos 8 caracteres.' },
        { status: 400 }
      );
    }

    if (![10, 13].includes(identificacionRuc.trim().length)) {
      return NextResponse.json(
        { success: false, error: 'La identificación (Cédula o RUC) debe tener 10 o 13 dígitos numéricos.' },
        { status: 400 }
      );
    }

    const roleMap: Record<string, string> = {
      ingeniero: 'ingeniero_residente',
      arquitecto: 'arquitecto_bim',
      contador: 'contador_constructora',
      bodeguero: 'bodeguero_constructora',
      tecnico_apoyo: 'tecnico_apoyo_obra',
      cliente: 'cliente_constructora',
    };

    const selectedRole = roleMap[tipoProfesional] || 'profesional_constructora';
    const adminClient = await createSupabaseAdminClient();

    // 1. Crear el usuario en auth.users con permisos de Admin (evita problemas de confirmación de email y RLS de registro)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        nombre: fullName.trim(),
        phone: phone?.trim() || null,
        tipo_profesional: tipoProfesional,
        role: selectedRole,
        identificacion: identificacionRuc.trim(),
        ruc: identificacionRuc.trim(),
        registro_profesional: registroSenescyt?.trim() || null,
        senescyt: registroSenescyt?.trim() || null,
        razon_social: razonSocial?.trim() || fullName.trim(),
        empresa: razonSocial?.trim() || fullName.trim(),
        codigo_contrato_obra: codigoContratoObra?.trim() || null,
        modulo_origen: 'sara_constructora',
        modulos_autorizados: ['sara_constructora'],
        status: 'activo',
        created_at: new Date().toISOString(),
      },
    });

    if (authError) {
      let msg = authError.message;
      if (msg.includes('already been registered') || msg.includes('already registered')) {
        msg = 'Este correo electrónico corporativo ya está registrado en GRUPO SARA.';
      }
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'No se pudo crear la cuenta de usuario.' },
        { status: 500 }
      );
    }

    // 2. Upsert idempotente en la tabla pública 'clientes' para garantizar integridad referencial
    const [nombrePart, ...apellidoParts] = fullName.trim().split(' ');
    const apellidoPart = apellidoParts.join(' ') || '';

    const { error: dbError } = await adminClient.from('clientes').upsert({
      id: authData.user.id,
      nombre: nombrePart || fullName.trim(),
      apellido: apellidoPart || '',
      email: email.trim(),
      telefono: phone?.trim() || null,
      es_admin: false,
      estado: 'activo',
    }, { onConflict: 'id' });

    if (dbError) {
      console.warn('Advertencia al insertar en tabla pública clientes:', dbError.message);
      // No bloqueamos el usuario ya creado en auth
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: selectedRole,
      },
    });
  } catch (error: any) {
    console.error('[/api/auth/register-professional error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error en el servidor al registrar profesional.' },
      { status: 500 }
    );
  }
}
