import { createClient } from "@/lib/supabase/client"

export interface CuentaBancariaEmpresa {
  id: string
  banco: string
  tipoCuenta: "Corriente" | "Ahorros"
  numeroCuenta: string
  cedulaRuc: string
  beneficiario: string
  correoComprobantes?: string
  activa?: boolean
  qrUrl?: string
}

export const DEFAULT_CUENTAS_BANCARIAS: CuentaBancariaEmpresa[] = [
  {
    id: "cta-1",
    banco: "Banco Pichincha",
    tipoCuenta: "Corriente",
    numeroCuenta: "2100239485",
    cedulaRuc: "0190458923001",
    beneficiario: "SARA CONSTRUCTORA CIA. LTDA.",
    correoComprobantes: "pagos@saraconstructora.com",
    activa: true
  },
  {
    id: "cta-2",
    banco: "Banco de Guayaquil",
    tipoCuenta: "Corriente",
    numeroCuenta: "0014892301",
    cedulaRuc: "0190458923001",
    beneficiario: "SARA CONSTRUCTORA CIA. LTDA.",
    correoComprobantes: "pagos@saraconstructora.com",
    activa: true
  }
]

export async function getCuentasBancarias(): Promise<CuentaBancariaEmpresa[]> {
  const supabase = createClient()
  try {
    const { data } = await supabase
      .from("parametros_globales")
      .select("indirectos_default")
      .eq("id", 1)
      .single()

    if (data?.indirectos_default?.cuentas_bancarias && Array.isArray(data.indirectos_default.cuentas_bancarias)) {
      return data.indirectos_default.cuentas_bancarias
    }
  } catch (err) {
    console.error("Error al obtener cuentas bancarias:", err)
  }
  return DEFAULT_CUENTAS_BANCARIAS
}

export async function saveCuentasBancarias(cuentas: CuentaBancariaEmpresa[]): Promise<boolean> {
  const supabase = createClient()
  try {
    const { data: current } = await supabase
      .from("parametros_globales")
      .select("indirectos_default")
      .eq("id", 1)
      .single()

    const currentIndirectos = current?.indirectos_default || {}
    const updated = {
      ...currentIndirectos,
      cuentas_bancarias: cuentas
    }

    const { error } = await supabase
      .from("parametros_globales")
      .update({ indirectos_default: updated })
      .eq("id", 1)

    return !error
  } catch (err) {
    console.error("Error al guardar cuentas bancarias:", err)
    return false
  }
}
