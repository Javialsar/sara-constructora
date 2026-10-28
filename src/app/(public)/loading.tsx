export default function Loading() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[60vh] w-full max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-6"
    >
      <div className="h-10 w-64 rounded-2xl bg-slate-800/20 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 rounded-3xl bg-slate-800/15 animate-pulse" />
        <div className="h-64 rounded-3xl bg-slate-800/15 animate-pulse" />
        <div className="h-64 rounded-3xl bg-slate-800/15 animate-pulse" />
      </div>
    </div>
  )
}
