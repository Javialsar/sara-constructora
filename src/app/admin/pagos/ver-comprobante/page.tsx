import { createClient } from "@supabase/supabase-js"
import { ExternalLink, Check, Download, Camera } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function VerComprobantePage({ searchParams }: { searchParams: { user?: string } }) {
  const userId = searchParams.user

  if (!userId) {
    return <div className="p-10 text-center font-bold text-red-500">ID de usuario no proporcionado.</div>
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  // Listar los archivos del bucket para este usuario
  const { data: files, error } = await supabaseAdmin
    .storage
    .from('sara-assets')
    .list('comprobantes', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
      search: userId
    })

  if (error || !files || files.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sin Comprobantes</h2>
          <p className="text-sm text-slate-500 mb-6">No se encontraron comprobantes subidos por este usuario.</p>
          <a href="/admin/pagos" className="text-blue-600 font-bold hover:underline">Volver a Pagos</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Comprobantes del Cliente</h1>
            <p className="text-slate-500 text-sm mt-1 font-mono">{userId}</p>
          </div>
          <a href="/admin/pagos" className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">
            Regresar
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {files.map(file => {
            const { data } = supabaseAdmin.storage.from('sara-assets').getPublicUrl(`comprobantes/${file.name}`)
            const isPdf = file.name.endsWith('.pdf')

            return (
              <div key={file.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-slate-100 border-b border-slate-200 flex items-center justify-center relative group">
                  {isPdf ? (
                    <div className="text-red-500 flex flex-col items-center gap-2">
                      <span className="font-bold text-xl">PDF</span>
                      <p className="text-xs text-slate-500">Documento Adjunto</p>
                    </div>
                  ) : (
                    <img src={data.publicUrl} alt="Comprobante" className="w-full h-full object-cover" />
                  )}
                  
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={data.publicUrl} target="_blank" className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600">
                      <ExternalLink size={16} /> Abrir Completo
                    </a>
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 truncate" title={file.name}>{file.name}</h3>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{new Date(file.created_at || Date.now()).toLocaleString('es-ES')}</span>
                    <a href={data.publicUrl} download className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Download size={14} /> Descargar
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
