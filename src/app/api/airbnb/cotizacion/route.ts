import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { AIRBNB_DATA } from "@/components/stays/AirbnbData"
import { getStaysPolicies, DEFAULT_STAYS_POLICIES } from "@/lib/services/staysPoliciesService"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
}

/**
 * POST /api/airbnb/cotizacion
 * Genera el desglose financiero autoritativo de una estancia:
 * Noches, tarifa base, limpieza, IVA (SRI Ecuador), anticipo y cronograma de cancelación.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stayCode, checkIn, checkOut, guestsCount = 2 } = body

    if (!stayCode || !checkIn || !checkOut) {
      return NextResponse.json({ error: "stayCode, checkIn y checkOut son requeridos" }, { status: 400 })
    }

    const dIn = new Date(checkIn).getTime()
    const dOut = new Date(checkOut).getTime()

    if (isNaN(dIn) || isNaN(dOut) || dOut <= dIn) {
      return NextResponse.json({ error: "Rango de fechas inválido. Check-out debe ser posterior al check-in." }, { status: 400 })
    }

    const noches = Math.max(1, Math.round((dOut - dIn) / (1000 * 60 * 60 * 24)))

    // 1. Obtener tarifas de la propiedad
    let precioNoche = 50.0
    let tarifaLimpieza = 15.0
    let titulo = "Alojamiento SARA"
    let ciudad = "Cuenca"
    let pais = "Ecuador"
    let maxHuespedes = 2

    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        const { data: stayDB } = await supabase
          .from("alojamientos_airbnb")
          .select("precio_noche, tarifa_limpieza, titulo, ciudad, pais, max_huespedes")
          .eq("codigo", stayCode)
          .maybeSingle()

        if (stayDB) {
          precioNoche = Number(stayDB.precio_noche) || precioNoche
          tarifaLimpieza = Number(stayDB.tarifa_limpieza) || tarifaLimpieza
          titulo = stayDB.titulo || titulo
          ciudad = stayDB.ciudad || ciudad
          pais = stayDB.pais || pais
          maxHuespedes = Number(stayDB.max_huespedes) || maxHuespedes
        }
      } catch {}
    }

    if (titulo === "Alojamiento SARA") {
      const staticStay = AIRBNB_DATA.find(s => s.codigo === stayCode || s.id === stayCode)
      if (staticStay) {
        precioNoche = staticStay.precioNoche
        tarifaLimpieza = staticStay.tarifaLimpieza
        titulo = staticStay.titulo
        ciudad = staticStay.ciudad
        pais = staticStay.pais
        maxHuespedes = staticStay.maxHuespedes
      }
    }

    // 2. Obtener políticas vigentes de la empresa
    const politicas = await getStaysPolicies()

    // 3. Cálculos monetarios
    const subtotalNoches = +(precioNoche * noches).toFixed(2)
    const subtotalServicios = +(subtotalNoches + tarifaLimpieza).toFixed(2)
    
    // IVA Turístico: 15% ordinario o tarifa configurada
    const ivaPorcentaje = politicas.ivaPorcentaje || 15
    const valorIva = +((subtotalServicios * ivaPorcentaje) / 100).toFixed(2)
    const granTotal = +(subtotalServicios + valorIva).toFixed(2)

    // Anticipo
    const porcentajeAnticipo = politicas.porcentajeAnticipo || 45
    const montoAnticipo = +((granTotal * porcentajeAnticipo) / 100).toFixed(2)
    const saldoPendienteCheckIn = +(granTotal - montoAnticipo).toFixed(2)

    // Cronograma de penalización por cancelación
    const cronogramaCancelacion = [
      {
        rango: "Más de 10 días antes del check-in",
        penalizacionPct: politicas.penalizacionMas10Dias,
        reembolsoPct: Math.max(0, 100 - politicas.penalizacionMas10Dias),
        montoReembolsoUSD: +(granTotal * (Math.max(0, 100 - politicas.penalizacionMas10Dias) / 100)).toFixed(2)
      },
      {
        rango: "De 5 a 10 días antes del check-in",
        penalizacionPct: politicas.penalizacion5a10Dias,
        reembolsoPct: Math.max(0, 100 - politicas.penalizacion5a10Dias),
        montoReembolsoUSD: +(granTotal * (Math.max(0, 100 - politicas.penalizacion5a10Dias) / 100)).toFixed(2)
      },
      {
        rango: "De 2 a 5 días antes del check-in",
        penalizacionPct: politicas.penalizacion2a5Dias,
        reembolsoPct: Math.max(0, 100 - politicas.penalizacion2a5Dias),
        montoReembolsoUSD: +(granTotal * (Math.max(0, 100 - politicas.penalizacion2a5Dias) / 100)).toFixed(2)
      },
      {
        rango: "Dentro de las 24 horas del check-in",
        penalizacionPct: politicas.penalizacion24Horas,
        reembolsoPct: 0,
        montoReembolsoUSD: 0.00
      }
    ]

    return NextResponse.json({
      success: true,
      propiedad: {
        codigo: stayCode,
        titulo,
        ciudad,
        pais,
        maxHuespedes
      },
      fechas: {
        checkIn,
        checkOut,
        noches,
        huespedes: guestsCount
      },
      desglose: {
        precioNocheUSD: precioNoche,
        subtotalNochesUSD: subtotalNoches,
        tarifaLimpiezaUSD: tarifaLimpieza,
        ivaPorcentaje: ivaPorcentaje,
        ivaUSD: valorIva,
        granTotalUSD: granTotal
      },
      opcionesPago: {
        pagoTotalUSD: granTotal,
        anticipoFlexible: {
          porcentaje: porcentajeAnticipo,
          montoUSD: montoAnticipo,
          saldoCheckInUSD: saldoPendienteCheckIn
        }
      },
      politicaCancelacion: {
        diasReembolso: politicas.diasReembolso,
        metodo: politicas.metodoDevolucion,
        cronograma: cronogramaCancelacion
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
