import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
}

function formatDateToICal(dateStr: string): string {
  // Convierte YYYY-MM-DD a YYYYMMDD
  return dateStr.replace(/-/g, "")
}

/**
 * GET /api/airbnb/ical?stayCode=SARA-EC-01
 * Exporta el feed de calendario en formato RFC 5545 (iCalendar) para sincronización con OTAs (Airbnb, Booking.com, Google Calendar)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stayCode = searchParams.get("stayCode") || "SARA-EC-01"

    const supabase = getSupabaseAdmin()
    const events: Array<{ uid: string; start: string; end: string; summary: string }> = []

    if (supabase) {
      // 1. Obtener reservas confirmadas
      const { data: solicitudes } = await supabase
        .from("solicitudes_servicio")
        .select("id, mensaje")
        .eq("tipo_servicio", "alojamiento_airbnb")

      if (Array.isArray(solicitudes)) {
        for (const sol of solicitudes) {
          try {
            const det = typeof sol.mensaje === "string" ? JSON.parse(sol.mensaje) : (sol.mensaje || {})
            const sCode = det.alojamiento?.codigo || det.alojamiento?.id
            if (sCode === stayCode && det.fechas?.check_in && det.fechas?.check_out && det.estado_reserva !== "cancelada") {
              events.push({
                uid: `rsv-${det.codigo_reserva || sol.id}@stays.gruposara.ec`,
                start: formatDateToICal(det.fechas.check_in),
                end: formatDateToICal(det.fechas.check_out),
                summary: `Reservado SARA Stays (${det.codigo_reserva || 'Directo'})`
              })
            }
          } catch {}
        }
      }

      // 2. Obtener bloqueos de mantenimiento
      try {
        const { data: blocks } = await supabase
          .from("stays_availability_blocks")
          .select("id, start_date, end_date, reason")
          .eq("stay_code", stayCode)

        if (Array.isArray(blocks)) {
          blocks.forEach(b => {
            events.push({
              uid: `block-${b.id}@stays.gruposara.ec`,
              start: formatDateToICal(b.start_date),
              end: formatDateToICal(b.end_date),
              summary: `Bloqueado - ${b.reason || 'Mantenimiento'}`
            })
          })
        }
      } catch {}
    }

    // Construir archivo iCalendar estándar
    const nowStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GRUPO SARA//SARA STAYS Hospitality Engine//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:SARA Stays - ${stayCode}`,
      "X-WR-TIMEZONE:America/Guayaquil"
    ]

    for (const ev of events) {
      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${ev.uid}`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART;VALUE=DATE:${ev.start}`,
        `DTEND;VALUE=DATE:${ev.end}`,
        `SUMMARY:${ev.summary}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT"
      )
    }

    icsContent.push("END:VCALENDAR")
    const icsString = icsContent.join("\r\n")

    return new Response(icsString, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="sara-stays-${stayCode}.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/airbnb/ical
 * Importa un feed externo de Airbnb / Booking / VRBO para sincronizar disponibilidad bidireccional
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stayCode, iCalUrl, rawIcsContent } = body

    if (!stayCode || (!iCalUrl && !rawIcsContent)) {
      return NextResponse.json({ error: "stayCode y iCalUrl (o rawIcsContent) son obligatorios" }, { status: 400 })
    }

    let icsText = rawIcsContent || ""
    if (iCalUrl) {
      const res = await fetch(iCalUrl)
      if (!res.ok) {
        return NextResponse.json({ error: `No se pudo descargar el feed iCal desde ${iCalUrl}` }, { status: 400 })
      }
      icsText = await res.text()
    }

    // Parser básico de VEVENT de iCalendar
    const parsedEvents: Array<{ start: string; end: string; summary: string }> = []
    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g
    let match: RegExpExecArray | null

    while ((match = veventRegex.exec(icsText)) !== null) {
      const eventBody = match[1]
      const dtStartMatch = eventBody.match(/DTSTART(?:;VALUE=DATE)?:([0-9]{8})/)
      const dtEndMatch = eventBody.match(/DTEND(?:;VALUE=DATE)?:([0-9]{8})/)
      const summaryMatch = eventBody.match(/SUMMARY:(.*?)(?:\r?\n|$)/)

      if (dtStartMatch && dtEndMatch) {
        const rawStart = dtStartMatch[1]
        const rawEnd = dtEndMatch[1]
        const formattedStart = `${rawStart.slice(0, 4)}-${rawStart.slice(4, 6)}-${rawStart.slice(6, 8)}`
        const formattedEnd = `${rawEnd.slice(0, 4)}-${rawEnd.slice(4, 6)}-${rawEnd.slice(6, 8)}`

        parsedEvents.push({
          start: formattedStart,
          end: formattedEnd,
          summary: summaryMatch ? summaryMatch[1].trim() : "Reserva Externa OTA"
        })
      }
    }

    // Persistir bloqueos en base de datos
    const supabase = getSupabaseAdmin()
    let savedCount = 0

    if (supabase && parsedEvents.length > 0) {
      try {
        const insertPayload = parsedEvents.map(ev => ({
          stay_code: stayCode,
          start_date: ev.start,
          end_date: ev.end,
          reason: "reserva_externa_ical"
        }))

        const { error } = await supabase
          .from("stays_availability_blocks")
          .insert(insertPayload)

        if (!error) savedCount = insertPayload.length
      } catch (dbErr) {
        console.warn("Aviso guardando bloqueos iCal en Supabase:", dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      stayCode,
      eventosImportados: parsedEvents.length,
      guardadosEnBD: savedCount,
      eventos: parsedEvents
    })
  } catch (err: any) {
    console.error("Error en importación iCal:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
