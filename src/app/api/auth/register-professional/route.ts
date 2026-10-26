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
      representante_legal: 'representante_legal',
      ingeniero: 'ingeniero_residente',
      arquitecto: 'arquitecto_bim',
      contador: 'contador_constructora',
      bodeguero: 'bodeguero_constructora',
      tecnico_apoyo: 'tecnico_apoyo_obra',
      cliente: 'cliente_constructora',
    };

    const requestedRole = roleMap[tipoProfesional] || 'cliente_constructora';
    const adminClient = await createSupabaseAdminClient();

    // Extraer nombre y apellido de forma limpia
    const nameParts = fullName.trim().split(/\s+/);
    const nombre = nameParts[0] || 'Usuario';
    const apellido = nameParts.slice(1).join(' ') || nameParts[0] || 'Constructora';
    const cleanPhone = phone?.trim() || '';

    // Principio de Menor Privilegio Zero-Trust:
    // Los nuevos profesionales se registran con estado 'pendiente_aprobacion'.
    // Requieren verificación de SENESCYT y aprobación de Master Admin antes de acceder a la suite técnica.
    const initialStatus = requestedRole === 'cliente_constructora' ? 'activo' : 'pendiente_aprobacion';

    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true,
      app_metadata: {
        role: requestedRole,
        status: initialStatus,
        modulo_origen: 'sara_constructora',
        modulos_autorizados: ['sara_constructora'],
        es_admin: false,
        aprobado_por_admin: requestedRole === 'cliente_constructora'
      },
      user_metadata: {
        nombre: nombre,
        apellido: apellido,
        telefono: cleanPhone,
        full_name: fullName.trim(),
        phone: cleanPhone,
        tipo_profesional: tipoProfesional,
        role: requestedRole,
        identificacion: identificacionRuc.trim(),
        ruc: identificacionRuc.trim(),
        registro_profesional: registroSenescyt?.trim() || null,
        senescyt: registroSenescyt?.trim() || null,
        razon_social: razonSocial?.trim() || fullName.trim(),
        empresa: razonSocial?.trim() || fullName.trim(),
        codigo_contrato_obra: codigoContratoObra?.trim() || null,
        modulo_origen: 'sara_constructora',
        status: initialStatus,
        created_at: new Date().toISOString(),
      },
    });

    if (authError) {
      let msg = authError.message;
      if (msg.includes('already been registered') || msg.includes('already registered')) {
        msg = 'Este correo electrónico corporativo ya está registrado en GRUPO SARA.';
      } else if (msg.includes('Database error') || msg.includes('creating new user')) {
        msg = 'Error al registrar usuario en la base de datos. Por favor verifique sus datos.';
      }
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'No se pudo crear la cuenta de usuario.' },
        { status: 500 }
      );
    }

    // 2. Upsert idempotente en la tabla pública 'clientes'
    const { error: dbError } = await adminClient.from('clientes').upsert({
      id: authData.user.id,
      nombre: nombre,
      apellido: apellido,
      email: email.trim(),
      telefono: cleanPhone || null,
      es_admin: false,
      estado: initialStatus,
    }, { onConflict: 'id' });

    if (dbError) {
      console.warn('Advertencia al insertar en tabla pública clientes:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      mensaje: initialStatus === 'pendiente_aprobacion'
        ? 'Cuenta profesional registrada con éxito. Su perfil está en proceso de validación técnica de credenciales SENESCYT.'
        : 'Cuenta creada y activada con éxito.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: requestedRole,
        status: initialStatus
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
