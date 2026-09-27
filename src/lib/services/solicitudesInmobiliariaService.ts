export interface SolicitudInmobiliaria {
  id: string
  fechaHora: string
  clienteNombre: string
  clienteTelefono: string
  clienteEmail?: string
  modalidad: "venta" | "arriendo"
  tipo: "casa" | "departamento" | "terreno" | "quinta" | "suite" | "local"
  precioEstimado: number
  ciudad: string
  sector: string
  descripcion?: string
  estado: "pendiente" | "atendida" | "confirmada"
  notasAdmin?: string
}

export const SOLICITUDES_INICIALES: SolicitudInmobiliaria[] = [
  {
    id: "sol-101",
    fechaHora: "2026-09-27T16:45:00",
    clienteNombre: "Dra. María Elena Carrión",
    clienteTelefono: "+593 98 456 7890",
    clienteEmail: "maria.carrion@gmail.com",
    modalidad: "venta",
    tipo: "casa",
    precioEstimado: 215000,
    ciudad: "Cuenca",
    sector: "San Joaquín / Medio Ejido",
    descripcion: "Casa de 3 dormitorios con jardín amplio y acabados de madera. Desea publicar con Plan Destacado para venderla antes de fin de año.",
    estado: "pendiente",
    notasAdmin: "Cliente interesada en pauta por redes sociales. Esperando llamada."
  },
  {
    id: "sol-102",
    fechaHora: "2026-09-27T14:10:00",
    clienteNombre: "Arq. Marcelo Cárdenas",
    clienteTelefono: "+593 99 876 5432",
    clienteEmail: "cardenas.arq@outlook.com",
    modalidad: "venta",
    tipo: "terreno",
    precioEstimado: 95000,
    ciudad: "Cuenca",
    sector: "Challuabamba",
    descripcion: "Lote plano de 450 m² con obras completas, ideal para construcción unifamiliar. Desea coordinar sesión de fotos con drone.",
    estado: "pendiente",
    notasAdmin: "Tiene escrituras al día y certificado de gravámenes."
  },
  {
    id: "sol-103",
    fechaHora: "2026-09-26T18:30:00",
    clienteNombre: "Ing. Roberto Peñafiel",
    clienteTelefono: "+593 98 112 2334",
    clienteEmail: "r.penafiel@corporativo.ec",
    modalidad: "arriendo",
    tipo: "departamento",
    precioEstimado: 600,
    ciudad: "Cuenca",
    sector: "Av. Solano / Remigio Crespo",
    descripcion: "Departamento amoblado de 2 habitaciones en edificio moderno con ascensor y parqueadero cubierto.",
    estado: "atendida",
    notasAdmin: "Se envió cotización del Plan Básico por WhatsApp. Pendiente respuesta de confirmación."
  },
  {
    id: "sol-104",
    fechaHora: "2026-09-25T11:20:00",
    clienteNombre: "Lcda. Carmen Ordóñez",
    clienteTelefono: "+593 99 334 5566",
    clienteEmail: "carmen.ordonez@loja.net",
    modalidad: "venta",
    tipo: "quinta",
    precioEstimado: 175000,
    ciudad: "Loja",
    sector: "Malacatos / Vilcabamba",
    descripcion: "Quinta campestre vacacional con árboles frutales y piscina pequeña, clima cálido y vista panorámica.",
    estado: "confirmada",
    notasAdmin: "Contrato firmado y comprobante de pago de Plan Premium recibido. Lista para publicar en el sistema."
  },
  {
    id: "sol-105",
    fechaHora: "2026-09-24T09:15:00",
    clienteNombre: "Econ. Xavier Maldonado",
    clienteTelefono: "+593 97 654 3210",
    clienteEmail: "xmaldonado@empresa.ec",
    modalidad: "arriendo",
    tipo: "local",
    precioEstimado: 850,
    ciudad: "Cuenca",
    sector: "Centro Histórico / Bolívar",
    descripcion: "Local comercial esquinero de 80 m² con vitrina a la calle y alto flujo peatonal.",
    estado: "atendida",
    notasAdmin: "Visita comercial realizada por asesor. Propietario revisando condiciones del contrato de corretaje."
  }
]

const STORAGE_KEY = "sara_inmobiliaria_solicitudes"

export async function getSolicitudesInmobiliaria(): Promise<SolicitudInmobiliaria[]> {
  try {
    const res = await fetch(`/api/inmobiliaria/solicitudes?t=${Date.now()}`, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.solicitudes) && data.solicitudes.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.solicitudes))
        }
        return data.solicitudes
      }
    }
  } catch (err) {
    console.warn("Aviso: no se pudo cargar solicitudes desde API:", err)
  }

  if (typeof window !== "undefined") {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) {
        console.error("Error parseando solicitudes de localStorage", e)
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SOLICITUDES_INICIALES))
  }

  return SOLICITUDES_INICIALES
}

export async function saveSolicitudesInmobiliaria(solicitudes: SolicitudInmobiliaria[]): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes))
    window.dispatchEvent(new CustomEvent("sara_inmobiliaria_solicitudes_updated", { detail: solicitudes }))
  }

  try {
    const res = await fetch("/api/inmobiliaria/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solicitudes })
    })
    const data = await res.json()
    return { success: data.success ?? true }
  } catch (err: any) {
    console.warn("Aviso: se guardó localmente pero falló API:", err.message)
    return { success: true }
  }
}
