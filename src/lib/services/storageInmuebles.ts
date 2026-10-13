import { createClient } from "@/lib/supabase/client"

export interface UploadResult {
  url: string
  storagePath: string
  error?: string
}

/**
 * Sube una foto o video al bucket público 'inmuebles-media' de Supabase
 */
export async function uploadInmuebleMedia(
  file: File,
  folder: "fotos" | "videos" = "fotos"
): Promise<UploadResult> {
  const supabase = createClient()
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("inmuebles-media")
    .upload(fileName, file, {
      cacheControl: "31536000",
      upsert: false
    })

  if (uploadError) {
    console.error("Error subiendo medio a Supabase Storage:", uploadError)
    throw new Error(`Error al subir archivo: ${uploadError.message}`)
  }

  const { data } = supabase.storage
    .from("inmuebles-media")
    .getPublicUrl(fileName)

  return {
    url: data.publicUrl,
    storagePath: fileName
  }
}

/**
 * Sube un documento confidencial al bucket privado 'inmuebles-documentos'
 */
export async function uploadInmuebleDocumentoPrivado(
  file: File,
  tipoDocumento: string
): Promise<UploadResult> {
  const supabase = createClient()
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf"
  const fileName = `${tipoDocumento}/${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("inmuebles-documentos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    })

  if (uploadError) {
    console.error("Error subiendo documento privado a Supabase:", uploadError)
    throw new Error(`Error al subir documento: ${uploadError.message}`)
  }

  return {
    url: "", // Privado: se accede únicamente mediante Signed URL
    storagePath: fileName
  }
}
