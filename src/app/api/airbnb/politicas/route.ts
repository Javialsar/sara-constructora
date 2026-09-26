import { NextResponse } from "next/server"
import { getStaysPolicies, saveStaysPolicies } from "@/lib/services/staysPoliciesService"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const policies = await getStaysPolicies()
    return NextResponse.json({ success: true, policies })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || typeof body.porcentajeAnticipo !== "number") {
      return NextResponse.json({ success: false, error: "Datos de políticas incompletos" }, { status: 400 })
    }

    const saved = await saveStaysPolicies(body)
    return NextResponse.json({ success: true, saved, policies: body })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
