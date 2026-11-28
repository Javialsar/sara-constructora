"use server"

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor ingrese sus credenciales.' }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Credenciales inválidas. Verifique su correo y contraseña.' }
  }

  redirect('/portal/dashboard')
}

export async function adminLoginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const rawRedirectTo = (formData.get('redirectTo') as string) || ''

  if (!email || !password) {
    return { error: 'Por favor ingrese sus credenciales corporativas.' }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: 'Credenciales inválidas. Verifique su correo y contraseña.' }
  }

  const user = data.user
  const appMeta = user.app_metadata || {}
  const appRole = String(appMeta.role || '')
  let hasVerifiedAdminAccess = Boolean(
    appMeta.es_admin === true ||
    appMeta.sara_master === true ||
    appRole === 'admin' ||
    appRole === 'superadmin' ||
    appRole === 'tecnico'
  )

  // Respaldo Zero-Trust contra BD: si el administrador fue creado antes de migrar app_metadata,
  // verificamos su registro activo con es_admin = true en public.clientes y sincronizamos app_metadata.
  if (!hasVerifiedAdminAccess) {
    try {
      const adminClient = await createSupabaseAdminClient()
      const { data: clienteAdmin } = await adminClient
        .from('clientes')
        .select('id, nombre, apellido, es_admin, estado')
        .eq('id', user.id)
        .eq('es_admin', true)
        .eq('estado', 'activo')
        .maybeSingle()

      if (clienteAdmin) {
        const fullName =
          user.user_metadata?.full_name ||
          `${clienteAdmin.nombre || ''} ${clienteAdmin.apellido || ''}`.trim()

        await adminClient.auth.admin.updateUserById(user.id, {
          app_metadata: {
            ...appMeta,
            role: 'admin',
            es_admin: true,
            sara_master: true,
          },
          user_metadata: {
            ...(user.user_metadata || {}),
            ...(fullName ? { full_name: fullName } : {}),
            role: 'admin',
          },
        })

        // Refrescar el JWT en cookies para que src/proxy.ts reciba el app_metadata actualizado de inmediato
        await supabase.auth.refreshSession()
        hasVerifiedAdminAccess = true
      }
    } catch (syncError) {
      console.error('Error sincronizando app_metadata de administrador:', syncError)
    }
  }

  if (!hasVerifiedAdminAccess) {
    await supabase.auth.signOut()
    return {
      error:
        'Acceso denegado: Esta cuenta no cuenta con privilegios de Administrador del Ecosistema GRUPO SARA.',
    }
  }

  const safeRedirect =
    rawRedirectTo.startsWith('/admin') &&
    !rawRedirectTo.startsWith('//') &&
    !rawRedirectTo.includes('\\') &&
    !rawRedirectTo.startsWith('/admin/login')
      ? rawRedirectTo
      : '/admin'

  redirect(safeRedirect)
}

export async function registerAction(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const telefono = formData.get('telefono') as string
  const email = formData.get('email') as string
  const usuario = formData.get('usuario') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!nombre || !apellido || !telefono || !email || !usuario || !password) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const supabase = await createSupabaseServerClient()
  const adminClient = await createSupabaseAdminClient()

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        apellido,
        role: 'cliente',
      },
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'El correo electrónico ya está registrado.' }
    }
    return { error: 'Error al crear la cuenta: ' + authError.message }
  }

  // 2. Insert is now handled automatically by the Supabase Postgres Trigger on_auth_user_created
  // No need to manually insert into clientes here.

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/portal')
}

export async function adminLogoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function createInternalUserAction(formData: FormData) {
  const adminSupabase = await createSupabaseServerClient()
  
  // Verify caller is admin (Zero-Trust: app_metadata)
  const { data: { user } } = await adminSupabase.auth.getUser()
  const callerAppMeta = user?.app_metadata || {}
  const callerIsAdmin = Boolean(
    callerAppMeta.es_admin === true ||
    callerAppMeta.sara_master === true ||
    callerAppMeta.role === 'admin' ||
    callerAppMeta.role === 'superadmin'
  )
  if (!callerIsAdmin) {
    return { error: 'No autorizado. Solo los administradores pueden crear cuentas.' }
  }

  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string // 'admin' | 'tecnico'

  if (!nombre || !email || !password || !role) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const adminClient = await createSupabaseAdminClient()
  const isRoleAdmin = role === 'admin' || role === 'superadmin'

  // create user directly with admin api, avoids logging out current user
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: nombre,
      role: role
    },
    app_metadata: {
      role: role,
      es_admin: isRoleAdmin,
      sara_master: isRoleAdmin
    }
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'El correo electrnico ya estǭ registrado.' }
    }
    return { error: 'Error al crear la cuenta: ' + error.message }
  }

  return { success: true }
}
