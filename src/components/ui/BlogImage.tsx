"use client"
import { useState } from "react"

interface BlogImageProps {
  src?: string | null
  alt: string
  className?: string
}

export default function BlogImage({ src, alt, className }: BlogImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center ${className || ''}`}>
        <span className="text-brand-sage/40 font-extrabold text-4xl tracking-widest uppercase">SARA</span>
        <span className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-wider">Arquitectura & Obra</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
    />
  )
}
