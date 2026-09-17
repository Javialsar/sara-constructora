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
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor ingrese sus credenciales.' }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Credenciales inválidas.' }
  }

  // Check admin role via user metadata
  const role = data.user?.user_metadata?.role
  const hasAccess = role === 'admin' || role === 'tecnico'
  if (!hasAccess) {
    await supabase.auth.signOut()
    return { error: 'No tiene permisos de acceso al panel.' }
  }

  redirect('/admin')
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

  // 2. Insert into clientes table using admin client (bypass RLS)
  const { error: dbError } = await adminClient
    .from('clientes')
    .insert([
      {
        nombre,
        apellido,
        telefono,
        email,
        usuario,
        password_hash: 'managed_by_supabase_auth',
        auth_id: authData.user?.id,
      },
    ])

  if (dbError) {
    if (dbError.code === '23505') {
      return { error: 'El usuario ya está registrado.' }
    }
    return { error: 'Error al registrar en la base de datos.' }
  }

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
  
  // Verify caller is admin
  const { data: { user } } = await adminSupabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') {
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
    return { error: 'La contrasea debe tener al menos 6 caracteres.' }
  }

  const adminClient = await createSupabaseAdminClient()

  // create user directly with admin api, avoids logging out current user
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: nombre,
      role: role
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
