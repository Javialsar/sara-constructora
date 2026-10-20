import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { InmuebleAdmin } from "@/app/admin/inmobiliaria/page"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
export const revalidate = 0

function sanitizeInmueblePublic(item: any) {
  const { legalidad, ...clean } = item
  return {
    ...clean,
    propietario: {
      nombre: clean.propietario?.nombre || "Asesor Inmobiliario SARA",
      telefono: clean.propietario?.telefono || "+593981804023",
      email: clean.propietario?.email || "contacto@inmobiliaria.sara"
    }
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false }
  })
}

// Datos semilla iniciales si la base de datos está vacía
const INMUEBLES_SEMILLA: InmuebleAdmin[] = [
  {
    id: "inm-1",
    codigo: "SARA-CAS-01",
    titulo: "Casa de Lujo en Challuabamba con Jardín Privado y Vista",
    tipo: "casa",
    modalidad: "venta",
    precio: 285000,
    ciudad: "Cuenca",
    sector: "Challuabamba",
    direccion: "Sector Colegio Alemán",
    areaM2: 520,
    areaConstruidaM2: 360,
    habitaciones: 4,
    banos: 4.5,
    parqueaderos: 3,
    antiguedad: "A estrenar",
    descripcion: "Espectacular residencia de diseño contemporáneo construida con estándares antisísmicos de primera. Áreas sociales de doble altura, cocina con isla de cuarzo y master suite con jacuzzi.",
    amenidades: ["Seguridad 24/7", "Área BBQ", "Cisterna y Bomba", "Gas Centralizado", "Jardín Amplio", "Acabados Importados", "Cámaras de Vigilancia"],
    coordenadas: { lat: -2.8752, lng: -78.9654 },
    imagenUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    galeriaImagenes: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80"
    ],
    videos: [],
    destacado: true,
    publicado: true,
    propietario: {
      nombre: "Ing. Carlos Vintimilla",
      telefono: "+593981804023",
      email: "carlos.vintimilla@constructora.ec",
      cuentaBancaria: {
        banco: "Banco Pichincha",
        tipoCuenta: "ahorros",
        numeroCuenta: "2204567890",
        titularCedula: "0104567890"
      }
    },
    promocion: {
      plan: "destacado",
      nombrePlan: "Plan Destacado",
      tarifaMensual: 65,
      porcentajeComision: 3,
      fechaInicio: "2026-09-01",
      fechaVencimiento: "2026-10-01",
      estadoPago: "al_dia",
      ultimoMontoPagado: 65,
      metodoPago: "Transferencia Banco Pichincha",
      totalRecaudado: 65
    }
  },
  {
    id: "inm-2",
    codigo: "SARA-DEP-02",
    titulo: "Departamento Panorámico Frente al Río Tomebamba",
    tipo: "departamento",
    modalidad: "venta",
    precio: 148000,
    ciudad: "Cuenca",
    sector: "Puertas del Sol",
    direccion: "Av. 3 de Noviembre",
    areaM2: 145,
    areaConstruidaM2: 125,
    habitaciones: 3,
    banos: 2.5,
    parqueaderos: 2,
    antiguedad: "2 a 4 años",
    descripcion: "Hermoso departamento en piso alto con vista frontal inigualable hacia el río y ciclovía. Edificio inteligente con ascensor de última generación y generador eléctrico total.",
    amenidades: ["Ascensor", "Generador Eléctrico", "Balcón Panorámico", "Bodega Privada", "Gimnasio"],
    coordenadas: { lat: -2.9025, lng: -79.0062 },
    imagenUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    galeriaImagenes: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
    ],
    videos: [],
    destacado: true,
    publicado: true,
    propietario: {
      nombre: "Dra. Mariana Cordero",
      telefono: "+593992345678",
      email: "mariana.cordero@medico.ec",
      cuentaBancaria: {
        banco: "Banco Guayaquil",
        tipoCuenta: "corriente",
        numeroCuenta: "0012345678",
        titularCedula: "0103214567"
      }
    },
    promocion: {
      plan: "destacado",
      nombrePlan: "Plan Destacado",
      tarifaMensual: 65,
      porcentajeComision: 3.5,
      fechaInicio: "2026-08-15",
      fechaVencimiento: "2026-09-30",
      estadoPago: "por_vencer",
      ultimoMontoPagado: 65,
      metodoPago: "Transferencia Banco Guayaquil",
      totalRecaudado: 130
    }
  },
  {
    id: "inm-3",
    codigo: "SARA-TER-03",
    titulo: "Terreno 100% Plano Listo para Construir en Ricaurte",
    tipo: "terreno",
    modalidad: "venta",
    precio: 79000,
    ciudad: "Cuenca",
    sector: "Ricaurte",
    direccion: "Vía a Sidcay",
    areaM2: 620,
    areaConstruidaM2: 0,
    habitaciones: 0,
    banos: 0,
    parqueaderos: 0,
    antiguedad: "A estrenar",
    descripcion: "Lote residencial con topografía perfectamente plana y todos los servicios básicos soterrados. Incluye anteproyecto arquitectónico prediseñado por SARA Constructora.",
    amenidades: ["Topografía Plana", "Obras Básicas Completas", "Vía Asfaltada", "Apto Biess"],
    coordenadas: { lat: -2.8592, lng: -78.9687 },
    imagenUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    galeriaImagenes: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"
    ],
    videos: [],
    destacado: false,
    publicado: true,
    propietario: {
      nombre: "Arq. Marcelo Álvarez",
      telefono: "+593984567890",
      email: "marcelo.alvarez@diseno.ec"
    },
    promocion: {
      plan: "basico",
      nombrePlan: "Plan Básico",
      tarifaMensual: 35,
      porcentajeComision: 4,
      fechaInicio: "2026-07-10",
      fechaVencimiento: "2026-09-10",
      estadoPago: "vencido",
      ultimoMontoPagado: 35,
      metodoPago: "Efectivo",
      totalRecaudado: 70
    }
  },
  {
    id: "inm-4",
    codigo: "SARA-QUI-04",
    titulo: "Quinta Campestre Moderna con Piscina Climatizada en Yunguilla",
    tipo: "quinta",
    modalidad: "venta",
    precio: 340000,
    ciudad: "Santa Isabel",
    sector: "Valle de Yunguilla",
    direccion: "Sector Léntag",
    areaM2: 1200,
    areaConstruidaM2: 240,
    habitaciones: 5,
    banos: 5,
    parqueaderos: 4,
    antiguedad: "1 año",
    descripcion: "El refugio campestre soñado con clima subtropical privilegiado todo el año. Casa con piscina temperada, pérgola BBQ y árboles frutales.",
    amenidades: ["Piscina", "Área BBQ", "Árboles Frutales", "Cisterna y Bomba", "Seguridad 24/7"],
    coordenadas: { lat: -3.2750, lng: -79.3160 },
    imagenUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
    galeriaImagenes: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80"
    ],
    videos: [],
    destacado: true,
    publicado: true,
    propietario: {
      nombre: "Abg. Fernando Pesántez",
      telefono: "+593991223344",
      email: "fernando.pesantez@abogados.ec"
    },
    promocion: {
      plan: "premium",
      nombrePlan: "Plan Premium Exclusiva",
      tarifaMensual: 120,
      porcentajeComision: 3,
      fechaInicio: "2026-09-01",
      fechaVencimiento: "2026-11-01",
      estadoPago: "al_dia",
      ultimoMontoPagado: 240,
      metodoPago: "Tarjeta de Crédito",
      totalRecaudado: 240
    }
  }
]

// GET: Obtener inmuebles con sanitización de privacidad y discriminación de rol
export async function GET(req: Request) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: true, inmuebles: INMUEBLES_SEMILLA.map(sanitizeInmueblePublic), source: "default_no_db" })
  }

  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    const role = user?.app_metadata?.role || user?.user_metadata?.role
    const isAdmin = Boolean(user?.app_metadata?.es_admin || user?.user_metadata?.es_admin || role === "admin" || role === "superadmin" || role === "tecnico")

    const { data, error } = await supabase
      .from("parametros_globales")
      .select("id, indirectos_default")
      .limit(1)
      .single()

    let catalogo: InmuebleAdmin[] = INMUEBLES_SEMILLA
    if (!error && data?.indirectos_default?.inmuebles_catalogo && Array.isArray(data.indirectos_default.inmuebles_catalogo)) {
      catalogo = data.indirectos_default.inmuebles_catalogo
    } else if (data?.id) {
      await supabase
        .from("parametros_globales")
        .update({
          indirectos_default: {
            ...(data.indirectos_default || {}),
            inmuebles_catalogo: INMUEBLES_SEMILLA
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", data.id)
    }

    // 1. Si es Administrador autenticado: acceso a catálogo completo
    if (isAdmin) {
      return NextResponse.json({
        success: true,
        inmuebles: catalogo,
        source: "supabase_admin"
      })
    }

    // 2. Si es Propietario autenticado solicitando sus propiedades
    const { searchParams } = new URL(req.url)
    const emailFiltro = searchParams.get("propietarioEmail")
    if (user && emailFiltro && user.email?.toLowerCase() === emailFiltro.toLowerCase()) {
      const propios = catalogo.filter(item => item.propietario?.email?.toLowerCase() === user.email?.toLowerCase())
      return NextResponse.json({
        success: true,
        inmuebles: propios,
        source: "supabase_owner"
      })
    }

    // 3. Consumo público anónimo: datos sanitizados sin cuentas bancarias ni documentos
    const publicos = catalogo.filter(item => item.publicado !== false).map(sanitizeInmueblePublic)
    return NextResponse.json({
      success: true,
      inmuebles: publicos,
      source: "supabase_public"
    })
  } catch (err: any) {
    console.error("Error leyendo inmuebles de Supabase:", err)
    return NextResponse.json({ success: true, inmuebles: INMUEBLES_SEMILLA.map(sanitizeInmueblePublic), source: "fallback" })
  }
}

// POST: Crear o actualizar inmuebles con autorización obligatoria
export async function POST(req: Request) {
  const serverClient = await createSupabaseServerClient()
  const { data: { user } } = await serverClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "No autorizado. Inicie sesión para guardar propiedades." }, { status: 401 })
  }

  const role = user.app_metadata?.role || user.user_metadata?.role
  const isAdmin = Boolean(user.app_metadata?.es_admin || user.user_metadata?.es_admin || role === "admin" || role === "superadmin" || role === "tecnico")

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Credenciales de Supabase no disponibles" }, { status: 500 })
  }

  try {
    const body = await req.json()

    // Solo admin puede sobreescribir listas masivas
    if (body.inmuebles && !isAdmin) {
      return NextResponse.json({ success: false, error: "Permisos insuficientes para sincronización masiva." }, { status: 403 })
    }

    // Si no es admin, validar que la propiedad pertenezca a su correo
    if (body.inmueble && !isAdmin) {
      const propEmail = body.inmueble.propietario?.email || body.inmueble.propietarioEmail
      if (!propEmail || propEmail.toLowerCase() !== user.email?.toLowerCase()) {
        return NextResponse.json({ success: false, error: "No autorizado para modificar propiedades ajenas." }, { status: 403 })
      }
    }

    const { data: globalParam, error: fetchErr } = await supabase
      .from("parametros_globales")
      .select("id, indirectos_default")
      .limit(1)
      .single()

    if (fetchErr || !globalParam?.id) {
      return NextResponse.json({ success: false, error: "Registro de parametros_globales no encontrado" }, { status: 404 })
    }

    const indirectos = globalParam.indirectos_default || {}
    let listaActual: InmuebleAdmin[] = Array.isArray(indirectos.inmuebles_catalogo)
      ? indirectos.inmuebles_catalogo
      : INMUEBLES_SEMILLA

    if (body.inmuebles && Array.isArray(body.inmuebles)) {
      listaActual = body.inmuebles
    } else if (body.inmueble) {
      const target: any = body.inmueble;
      if (!target.promocion) {
        target.promocion = {
          plan: target.planPromocion || 'basico',
          nombrePlan: 'Plan ' + (target.planPromocion || 'basico'),
          tarifaMensual: target.tarifaMensual || 0,
          porcentajeComision: target.porcentajeComision || 0,
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaVencimiento: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          estadoPago: 'vencido',
          ultimoMontoPagado: 0,
          metodoPago: 'Pendiente',
          totalRecaudado: 0
        };
      }
      const idx = listaActual.findIndex(item => item.id === target.id || item.codigo === target.codigo)
      if (idx >= 0) {
        if (!isAdmin && listaActual[idx].propietario?.email?.toLowerCase() !== user.email?.toLowerCase()) {
          return NextResponse.json({ success: false, error: "No autorizado para sobrescribir un inmueble que pertenece a otro propietario." }, { status: 403 })
        }
        listaActual[idx] = { ...listaActual[idx], ...target }
      } else {
        listaActual = [target, ...listaActual]
      }
    }

    const { error: updateErr } = await supabase
      .from("parametros_globales")
      .update({
        indirectos_default: {
          ...indirectos,
          inmuebles_catalogo: listaActual
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", globalParam.id)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: listaActual.length,
      source: "supabase"
    })
  } catch (err: any) {
    console.error("Error guardando inmueble en Supabase:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE: Eliminar un inmueble verificando identidad o privilegios de administrador
export async function DELETE(req: Request) {
  const serverClient = await createSupabaseServerClient()
  const { data: { user } } = await serverClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "No autorizado para eliminar inmuebles." }, { status: 401 })
  }

  const role = user.app_metadata?.role || user.user_metadata?.role
  const isAdmin = Boolean(user.app_metadata?.es_admin || user.user_metadata?.es_admin || role === "admin" || role === "superadmin" || role === "tecnico")

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Credenciales de Supabase no disponibles" }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const codigo = searchParams.get("codigo")

    if (!id && !codigo) {
      return NextResponse.json({ success: false, error: "Se requiere 'id' o 'codigo'" }, { status: 400 })
    }

    const { data: globalParam } = await supabase
      .from("parametros_globales")
      .select("id, indirectos_default")
      .limit(1)
      .single()

    if (globalParam?.id) {
      const indirectos = globalParam.indirectos_default || {}
      const listaActual: InmuebleAdmin[] = Array.isArray(indirectos.inmuebles_catalogo)
        ? indirectos.inmuebles_catalogo
        : []

      const targetItem = listaActual.find(item => (id && item.id === id) || (codigo && item.codigo === codigo))
      if (!targetItem) {
        return NextResponse.json({ success: false, error: "Inmueble no encontrado" }, { status: 404 })
      }

      // Validar si el usuario tiene permiso para borrar
      const esDuenio = targetItem.propietario?.email?.toLowerCase() === user.email?.toLowerCase()
      if (!isAdmin && !esDuenio) {
        return NextResponse.json({ success: false, error: "Permiso denegado para eliminar esta propiedad." }, { status: 403 })
      }

      const filtrada = listaActual.filter(item => {
        if (id && item.id === id) return false
        if (codigo && item.codigo === codigo) return false
        return true
      })

      await supabase
        .from("parametros_globales")
        .update({
          indirectos_default: {
            ...indirectos,
            inmuebles_catalogo: filtrada
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", globalParam.id)

      return NextResponse.json({ success: true, message: "Inmueble eliminado de la base de datos" })
    }

    return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
