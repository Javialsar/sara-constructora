export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-sage/30 border-t-brand-sage rounded-full animate-spin" />
        <p className="text-gray-500 font-medium uppercase tracking-widest text-sm animate-pulse">Cargando...</p>
      </div>
    </div>
  )
}
