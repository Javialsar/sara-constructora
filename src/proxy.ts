import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { canAccessModule, getUserPortalUrl, SaraModule } from './lib/auth/moduleGuards'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use supabase.auth.getUser() to safely validate JWT session
  const { data: { user } } = await supabase.auth.getUser()
  // SEGURIDAD ZERO-TRUST: Preservar app_metadata y user_metadata segregados sin aplanar
  // para que resolveMetadata() descarte estrictamente roles administrativos inyectados en user_metadata.
  const authContext = {
    app_metadata: user?.app_metadata || {},
    user_metadata: user?.user_metadata || {},
  }

  const pathname = request.nextUrl.pathname

  // 1. PROTECCIÓN DE SARA APU (/dashboard/*, /modulos/importador/*)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/modulos/importador')
  ) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(authContext, 'sara_apu')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_apu')
      return NextResponse.redirect(url)
    }
  }

  // 2. PROTECCIÓN DEL PANEL ADMINISTRATIVO MÁSTER (/admin/*)
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login'

    if (!user && !isLoginPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (user) {
      const hasAdminAccess = canAccessModule(authContext, 'sara_master')

      if (isLoginPage && hasAdminAccess) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }

      if (!isLoginPage && !hasAdminAccess) {
        const redirectUrl = getUserPortalUrl(authContext)
        const url = request.nextUrl.clone()
        url.pathname = redirectUrl
        url.searchParams.set('warning', 'sin_privilegios_admin')
        return NextResponse.redirect(url)
      }
    }
  }

  // 3. PROTECCIÓN PORTAL CLIENTES CONSTRUCTORA (/portal/dashboard/* y /constructora/suite/*)
  if (pathname.startsWith('/portal/dashboard') || pathname.startsWith('/constructora/suite')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.startsWith('/constructora/suite') ? '/constructora/auth' : '/portal'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(authContext, 'sara_constructora')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_constructora')
      return NextResponse.redirect(url)
    }
  }

  // 4. PROTECCIÓN SARA INMOBILIARIA (/inmobiliaria/mi-portal/*)
  if (pathname.startsWith('/inmobiliaria/mi-portal')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/inmobiliaria/auth'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(authContext, 'sara_inmobiliaria')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_inmobiliaria')
      return NextResponse.redirect(url)
    }
  }

  // 5. PROTECCIÓN SARA STAYS (/stays/mis-reservas/*)
  if (pathname.startsWith('/stays/mis-reservas')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/stays/auth'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(authContext, 'sara_stays')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_stays')
      return NextResponse.redirect(url)
    }
  }

  // 6. PROTECCIÓN SARA FLETES (/modulos/fletes/conductores/* y /modulos/fletes/mi-perfil/*)
  if (pathname.startsWith('/modulos/fletes/conductores') || pathname.startsWith('/modulos/fletes/mi-perfil')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/modulos/fletes/auth'
      url.searchParams.set('redirectTo', pathname)
      url.searchParams.set('rol', 'conductor')
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(authContext, 'sara_fletes')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_fletes')
      return NextResponse.redirect(url)
    }
  }

  // 7. PROTECCIÓN SARA TALENTO HUMANO (/modulos/talento/mi-perfil/*)
  if (pathname.startsWith('/modulos/talento/mi-perfil')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/modulos/talento/auth'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(authContext, 'sara_talento')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_talento')
      return NextResponse.redirect(url)
    }
  }

  // 8. PROTECCIÓN SARA FIRMA Y FACTURACIÓN ELECTRÓNICA SRI (/modulos/facturacion/*)
  // Permite acceso libre a /modulos/facturacion/auth para registro e inicio de sesión de emisores.
  // Protege /modulos/facturacion y subrutas privadas exigiendo sesión activa con tokens SRI válidos.
  if (pathname.startsWith('/modulos/facturacion') && !pathname.startsWith('/modulos/facturacion/auth')) {
    const facturacionCookie = request.cookies.get('sara_facturacion_session')?.value
    const hasAuth = Boolean(user || facturacionCookie)

    if (!hasAuth) {
      const url = request.nextUrl.clone()
      url.pathname = '/modulos/facturacion/auth'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (user && !canAccessModule(authContext, 'sara_facturacion')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_facturacion')
      return NextResponse.redirect(url)
    }
  }

  // 9. PROTECCIÓN SARA PAGOS (/modulos/financiero/*)
  // Al seleccionar SARA-PAGOS desde el landing principal, solicita primero autenticación/registro en /modulos/financiero/auth
  if (pathname.startsWith('/modulos/financiero') && !pathname.startsWith('/modulos/financiero/auth')) {
    const pagosCookie = request.cookies.get('sara_pagos_session')?.value
    const hasAuth = Boolean(user || pagosCookie)

    if (!hasAuth) {
      const url = request.nextUrl.clone()
      url.pathname = '/modulos/financiero/auth'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (user && !canAccessModule(authContext, 'sara_pagos')) {
      const redirectUrl = getUserPortalUrl(authContext)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_pagos')
      return NextResponse.redirect(url)
    }
  }

  // Redirección inteligente si una pestaña quedó con /login?redirectTo=/modulos/financiero
  const redirectToParam = request.nextUrl.searchParams.get('redirectTo') || ''
  if (pathname === '/login' && redirectToParam.startsWith('/modulos/financiero')) {
    const url = request.nextUrl.clone()
    url.pathname = '/modulos/financiero/auth'
    url.searchParams.delete('redirectTo')
    return NextResponse.redirect(url)
  }

  // Si usuario autenticado visita la página de login de un módulo específico y ya pertenece a él
  if (pathname === '/login' && user && canAccessModule(authContext, 'sara_apu')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (pathname === '/modulos/financiero/auth') {
    const pagosCookie = request.cookies.get('sara_pagos_session')?.value
    if ((user && canAccessModule(authContext, 'sara_pagos')) || pagosCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/modulos/financiero'
      return NextResponse.redirect(url)
    }
  }

  if (pathname === '/modulos/facturacion/auth') {
    const facturacionCookie = request.cookies.get('sara_facturacion_session')?.value
    if ((user && canAccessModule(authContext, 'sara_facturacion')) || facturacionCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/modulos/facturacion'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/portal/dashboard/:path*',
    '/constructora/suite/:path*',
    '/inmobiliaria/mi-portal/:path*',
    '/stays/mis-reservas/:path*',
    '/modulos/fletes/conductores/:path*',
    '/modulos/fletes/mi-perfil/:path*',
    '/modulos/talento/mi-perfil/:path*',
    '/modulos/facturacion/:path*',
    '/modulos/facturacion',
    '/modulos/financiero/:path*',
    '/modulos/financiero',
    '/modulos/importador/:path*',
    '/login',
  ],
}
