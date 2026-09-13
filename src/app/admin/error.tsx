"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Algo salió mal!</h2>
        <p className="text-gray-500 mb-8 text-sm">
          No pudimos cargar esta página. Puede ser un error de conexión o un problema temporal en nuestros servidores.
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-brand-dark text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={18} /> Intentar nuevamente
        </button>
      </div>
    </div>
  )
}
