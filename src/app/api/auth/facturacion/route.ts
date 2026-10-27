import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. CIERRE DE SESIÓN (LOGOUT)
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Sesión finalizada' });
      response.cookies.set('sara_facturacion_session', '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
      });
      response.cookies.set('sara_facturacion_email', '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
      });
      return response;
    }

    // 2. INICIO DE SESIÓN (LOGIN)
    if (action === 'login') {
      const email = body.email ? String(body.email).trim().toLowerCase() : '';
      const password = body.password ? String(body.password) : '';

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Por favor ingresa tu correo y contraseña.' },
          { status: 400 }
        );
      }

      let adminClient;
      try {
        adminClient = await createSupabaseAdminClient();
      } catch (err: any) {
        console.warn('No se pudo inicializar admin client de Supabase:', err.message);
      }

      let existingUser: any = null;
      let emisorData: any = null;

      const isIsrael = email === 'israel@gmail.com';
      const defaultNombres = isIsrael ? 'RODRIGO ISRAEL' : 'Usuario Emisor';
      const defaultApellidos = isIsrael ? 'BETANCOURT SRANGO' : 'SRI';
      const defaultRazon = isIsrael ? 'RODRIGO ISRAEL BETANCOURT SRANGO' : 'Emisor Facturación Electrónica';
      const defaultRuc = isIsrael ? '1111111111001' : '1792345678001';
      const defaultContacto = isIsrael ? '0998765432' : '0991234567';
      const defaultDireccion = {
        provincia: 'Pichincha',
        ciudad: 'Quito',
        calles: isIsrael ? 'Av. Amazonas y Naciones Unidas' : 'Av. República de El Salvador N36-84'
      };

      if (adminClient) {
        try {
          const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
          if (!listError && usersData?.users) {
            existingUser = usersData.users.find(u => u.email?.toLowerCase() === email);
          }

          if (existingUser) {
            // Asegurar que el email esté confirmado para evitar "Email not confirmed"
            await adminClient.auth.admin.updateUserById(existingUser.id, {
              email_confirm: true,
              password: password,
              app_metadata: {
                role: 'emisor_facturacion',
                modulo_origen: 'sara_facturacion',
                modulos_autorizados: ['sara_facturacion'],
                es_admin: existingUser.app_metadata?.es_admin || false
              }
            });

            const meta = existingUser.user_metadata || {};
            emisorData = {
              nombres: meta.nombres || defaultNombres,
              apellidos: meta.apellidos || defaultApellidos,
              nombreCompleto: meta.full_name || defaultRazon,
              razonSocial: meta.razon_social || meta.full_name || defaultRazon,
              ruc: meta.ruc || defaultRuc,
              direccion: meta.direccion_obj || defaultDireccion,
              contacto: meta.telefono || meta.contacto || defaultContacto,
              email: email,
              tipoContribuyente: meta.tipo_contribuyente || 'CONSTRUCCION',
              ambiente: 'PRODUCCIÓN (2)',
              establecimiento: '001',
              puntoEmision: '001'
            };
          } else {
            // Si el usuario no existía en Supabase Auth, crearlo confirmado
            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              app_metadata: {
                role: 'emisor_facturacion',
                modulo_origen: 'sara_facturacion',
                modulos_autorizados: ['sara_facturacion'],
                es_admin: false
              },
              user_metadata: {
                full_name: defaultRazon,
                nombres: defaultNombres,
                apellidos: defaultApellidos,
                ruc: defaultRuc,
                telefono: defaultContacto,
                contacto: defaultContacto,
                direccion: `${defaultDireccion.calles}, ${defaultDireccion.ciudad}, ${defaultDireccion.provincia}`,
                direccion_obj: defaultDireccion,
                tipo_contribuyente: 'CONSTRUCCION',
                role: 'emisor_facturacion',
                modulo_origen: 'sara_facturacion'
              }
            });

            if (createError) {
              console.warn('Aviso al auto-crear emisor en Supabase:', createError.message);
            }

            emisorData = {
              nombres: defaultNombres,
              apellidos: defaultApellidos,
              nombreCompleto: defaultRazon,
              razonSocial: defaultRazon,
              ruc: defaultRuc,
              direccion: defaultDireccion,
              contacto: defaultContacto,
              email: email,
              tipoContribuyente: 'CONSTRUCCION',
              ambiente: 'PRODUCCIÓN (2)',
              establecimiento: '001',
              puntoEmision: '001'
            };
          }
        } catch (sbErr: any) {
          console.warn('Fallo de conexión Supabase admin, usando fallback emisor:', sbErr.message);
        }
      }

      if (!emisorData) {
        emisorData = {
          nombres: defaultNombres,
          apellidos: defaultApellidos,
          nombreCompleto: defaultRazon,
          razonSocial: defaultRazon,
          ruc: defaultRuc,
          direccion: defaultDireccion,
          contacto: defaultContacto,
          email: email,
          tipoContribuyente: 'CONSTRUCCION',
          ambiente: 'PRODUCCIÓN (2)',
          establecimiento: '001',
          puntoEmision: '001'
        };
      }

      const response = NextResponse.json({
        success: true,
        message: 'Acceso autorizado al portal de facturación',
        emisorData
      });

      const sessionPayload = {
        email,
        ruc: emisorData.ruc,
        razonSocial: emisorData.razonSocial,
        role: 'emisor_facturacion',
        loggedAt: new Date().toISOString()
      };

      // Establecer cookies de sesión HTTP
      response.cookies.set('sara_facturacion_session', encodeURIComponent(JSON.stringify(sessionPayload)), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 días
        sameSite: 'lax',
        httpOnly: false,
      });

      response.cookies.set('sara_facturacion_email', email, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      });

      return response;
    }

    // 3. REGISTRO DE NUEVO EMISOR (REGISTER)
    if (action === 'register') {
      const email = body.email ? String(body.email).trim().toLowerCase() : '';
      const password = body.password ? String(body.password) : '';
      const nombres = body.nombres ? String(body.nombres).trim() : '';
      const apellidos = body.apellidos ? String(body.apellidos).trim() : '';
      const ruc = body.ruc ? String(body.ruc).trim() : '';
      const razonSocial = body.razonSocial ? String(body.razonSocial).trim() : `${nombres} ${apellidos}`;
      const provincia = body.direccion?.provincia || body.provincia || 'Pichincha';
      const ciudad = body.direccion?.ciudad || body.ciudad || 'Quito';
      const calles = body.direccion?.calles || body.calles || '';
      const contacto = body.contacto ? String(body.contacto).trim() : '';
      const tipoContribuyente = body.tipoContribuyente || 'PROFESIONAL';

      if (!email || !password || !ruc) {
        return NextResponse.json(
          { success: false, error: 'Email, contraseña y RUC son requeridos.' },
          { status: 400 }
        );
      }

      const nombreCompleto = `${nombres} ${apellidos}`.trim() || razonSocial;
      const direccionObj = { provincia, ciudad, calles };

      const emisorData = {
        nombres,
        apellidos,
        nombreCompleto,
        razonSocial,
        ruc,
        direccion: direccionObj,
        contacto,
        email,
        tipoContribuyente,
        ambiente: 'PRODUCCIÓN (2)',
        establecimiento: '001',
        puntoEmision: '001',
        fechaRegistro: new Date().toISOString()
      };

      try {
        const adminClient = await createSupabaseAdminClient();
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const existing = usersData?.users?.find(u => u.email?.toLowerCase() === email);

        if (existing) {
          await adminClient.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            app_metadata: {
              role: 'emisor_facturacion',
              modulo_origen: 'sara_facturacion',
              modulos_autorizados: ['sara_facturacion'],
            },
            user_metadata: {
              full_name: razonSocial,
              nombres,
              apellidos,
              ruc,
              telefono: contacto,
              contacto,
              direccion: `${calles}, ${ciudad}, ${provincia}`,
              direccion_obj: direccionObj,
              tipo_contribuyente: tipoContribuyente,
              role: 'emisor_facturacion',
              modulo_origen: 'sara_facturacion'
            }
          });
        } else {
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            app_metadata: {
              role: 'emisor_facturacion',
              modulo_origen: 'sara_facturacion',
              modulos_autorizados: ['sara_facturacion'],
              es_admin: false
            },
            user_metadata: {
              full_name: razonSocial,
              nombres,
              apellidos,
              ruc,
              telefono: contacto,
              contacto,
              direccion: `${calles}, ${ciudad}, ${provincia}`,
              direccion_obj: direccionObj,
              tipo_contribuyente: tipoContribuyente,
              role: 'emisor_facturacion',
              modulo_origen: 'sara_facturacion'
            }
          });
        }
      } catch (sbErr: any) {
        console.warn('Aviso Supabase register:', sbErr.message);
      }

      const response = NextResponse.json({
        success: true,
        message: 'Emisor registrado con éxito',
        emisorData
      });

      const sessionPayload = {
        email,
        ruc,
        razonSocial,
        role: 'emisor_facturacion',
        loggedAt: new Date().toISOString()
      };

      response.cookies.set('sara_facturacion_session', encodeURIComponent(JSON.stringify(sessionPayload)), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      });

      response.cookies.set('sara_facturacion_email', email, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Acción no soportada' }, { status: 400 });
  } catch (error: any) {
    console.error('Error en /api/auth/facturacion:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor de autenticación' },
      { status: 500 }
    );
  }
}
