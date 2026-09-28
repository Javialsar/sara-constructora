import { InmuebleAdmin } from "@/app/admin/inmobiliaria/page"

// Obtener inmuebles desde la Base de Datos (API)
export async function getInmueblesFromDB(): Promise<InmuebleAdmin[]> {
  try {
    const res = await fetch("/api/inmobiliaria/inmuebles", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    })
    if (res.ok) {
      const data = await res.json()
      if (data.inmuebles && Array.isArray(data.inmuebles)) {
        return data.inmuebles
      }
    }
  } catch (err) {
    console.warn("Error consultando inmuebles de la base de datos:", err)
  }
  return []
}

// Guardar o actualizar un inmueble en la Base de Datos (API)
export async function saveInmuebleToDB(inmueble: InmuebleAdmin): Promise<boolean> {
  try {
    const res = await fetch("/api/inmobiliaria/inmuebles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inmueble })
    })
    return res.ok
  } catch (err) {
    console.error("Error guardando inmueble en la base de datos:", err)
    return false
  }
}

// Guardar toda la lista de inmuebles sincronizada en la Base de Datos
export async function saveAllInmueblesToDB(inmuebles: InmuebleAdmin[]): Promise<boolean> {
  try {
    const res = await fetch("/api/inmobiliaria/inmuebles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inmuebles })
    })
    return res.ok
  } catch (err) {
    console.error("Error sincronizando inmuebles en la base de datos:", err)
    return false
  }
}

// Eliminar un inmueble de la Base de Datos por ID o Código
export async function deleteInmuebleFromDB(id: string, codigo?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams()
    if (id) params.set("id", id)
    if (codigo) params.set("codigo", codigo)

    const res = await fetch(`/api/inmobiliaria/inmuebles?${params.toString()}`, {
      method: "DELETE"
    })
    return res.ok
  } catch (err) {
    console.error("Error eliminando inmueble de la base de datos:", err)
    return false
  }
}
