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
  const appMeta = user?.app_metadata || {}
  const userMeta = user?.user_metadata || {}
  const metadata = { ...userMeta, ...appMeta }

  const pathname = request.nextUrl.pathname

  // 1. PROTECCIÓN DE SARA APU (/dashboard/*, /modulos/financiero/*, /modulos/importador/*)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/modulos/financiero') ||
    pathname.startsWith('/modulos/importador')
  ) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(metadata, 'sara_apu')) {
      const redirectUrl = getUserPortalUrl(metadata)
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
      const hasAdminAccess = canAccessModule(metadata, 'sara_master')

      if (isLoginPage && hasAdminAccess) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }

      if (!isLoginPage && !hasAdminAccess) {
        const redirectUrl = getUserPortalUrl(metadata)
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

    if (!canAccessModule(metadata, 'sara_constructora')) {
      const redirectUrl = getUserPortalUrl(metadata)
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

    if (!canAccessModule(metadata, 'sara_inmobiliaria')) {
      const redirectUrl = getUserPortalUrl(metadata)
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

    if (!canAccessModule(metadata, 'sara_stays')) {
      const redirectUrl = getUserPortalUrl(metadata)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_stays')
      return NextResponse.redirect(url)
    }
  }

  // 6. PROTECCIÓN SARA FLETES (/modulos/fletes/mi-perfil/*)
  if (pathname.startsWith('/modulos/fletes/mi-perfil')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/modulos/fletes/auth'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (!canAccessModule(metadata, 'sara_fletes')) {
      const redirectUrl = getUserPortalUrl(metadata)
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

    if (!canAccessModule(metadata, 'sara_talento')) {
      const redirectUrl = getUserPortalUrl(metadata)
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.set('warning', 'modulo_no_autorizado_talento')
      return NextResponse.redirect(url)
    }
  }

  // Si usuario autenticado visita la página de login de un módulo específico y ya pertenece a él
  if (pathname === '/login' && user && canAccessModule(metadata, 'sara_apu')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
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
    '/modulos/fletes/mi-perfil/:path*',
    '/modulos/talento/mi-perfil/:path*',
    '/modulos/financiero/:path*',
    '/modulos/importador/:path*',
    '/login',
  ],
}
