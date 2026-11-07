"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from "@/lib/services/logosService"
import { createClient } from "@/lib/supabase/client"

export type ModuloBrandKey =
  | "grupo_sara"
  | "constructora"
  | "inmobiliaria"
  | "stays"
  | "apu"
  | "compras"
  | "fletes"
  | "talento"
  | "fintech"
  | "financiero"
  | "facturacion"
  | "firma"

interface ModuleBrandMetadata {
  logoKey: keyof LogosEmpresa
  title: string
  subtitle: string
  href: string
  fallbackLogo: string
  accentText: string
  hoverText: string
  dropShadow: string
}

export const MODULE_BRAND_CATALOG: Record<ModuloBrandKey, ModuleBrandMetadata> = {
  grupo_sara: {
    logoKey: "grupo_sara",
    title: "GRUPO SARA",
    subtitle: "Ingeniería & Tecnología",
    href: "/",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.grupo_sara,
    accentText: "text-brand-sage",
    hoverText: "group-hover:text-amber-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(251,191,36,0.22)]",
  },
  constructora: {
    logoKey: "constructora",
    title: "SARA CONSTRUCTORA",
    subtitle: "Obras & Arquitectura",
    href: "/constructora",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.constructora,
    accentText: "text-brand-sage",
    hoverText: "group-hover:text-brand-sage",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(60,122,82,0.32)]",
  },
  inmobiliaria: {
    logoKey: "inmobiliaria",
    title: "SARA INMOBILIARIA",
    subtitle: "Bienes Raíces & Plusvalía",
    href: "/inmobiliaria",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.inmobiliaria,
    accentText: "text-emerald-400",
    hoverText: "group-hover:text-emerald-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(16,185,129,0.28)]",
  },
  stays: {
    logoKey: "stays",
    title: "SARA STAYS",
    subtitle: "Hospitality & Alojamiento",
    href: "/stays",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.stays,
    accentText: "text-amber-400",
    hoverText: "group-hover:text-amber-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(245,158,11,0.28)]",
  },
  apu: {
    logoKey: "apu",
    title: "SARA APU",
    subtitle: "Ingeniería de Costos & SERCOP",
    href: "/apu",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.apu,
    accentText: "text-blue-400",
    hoverText: "group-hover:text-blue-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(59,130,246,0.30)]",
  },
  compras: {
    logoKey: "compras",
    title: "SARA MARKETPLACE",
    subtitle: "Abastecimiento Mayorista B2B",
    href: "/modulos/compras",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.compras,
    accentText: "text-amber-400",
    hoverText: "group-hover:text-amber-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(245,158,11,0.28)]",
  },
  fletes: {
    logoKey: "fletes",
    title: "SARA FLETES",
    subtitle: "Logística Pesada & Renta",
    href: "/fletes",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.fletes,
    accentText: "text-orange-400",
    hoverText: "group-hover:text-orange-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(249,115,22,0.28)]",
  },
  talento: {
    logoKey: "talento",
    title: "SARA TALENTO",
    subtitle: "Red Técnica & Especialistas",
    href: "/modulos/talento",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.talento,
    accentText: "text-emerald-400",
    hoverText: "group-hover:text-emerald-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(16,185,129,0.28)]",
  },
  fintech: {
    logoKey: "fintech",
    title: "SARA PAGOS",
    subtitle: "Fideicomiso Escrow & SRI",
    href: "/modulos/financiero",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.fintech,
    accentText: "text-teal-400",
    hoverText: "group-hover:text-teal-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(20,184,166,0.28)]",
  },
  financiero: {
    logoKey: "fintech",
    title: "SARA PAGOS",
    subtitle: "Fideicomiso Escrow & SRI",
    href: "/modulos/financiero",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.fintech,
    accentText: "text-teal-400",
    hoverText: "group-hover:text-teal-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(20,184,166,0.28)]",
  },
  facturacion: {
    logoKey: "facturacion",
    title: "SARA FACTURACIÓN",
    subtitle: "Comprobantes SRI & Firma Digital",
    href: "/facturacion-electronica",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.facturacion || "/images/sara-facturacion.png",
    accentText: "text-amber-400",
    hoverText: "group-hover:text-amber-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(245,158,11,0.28)]",
  },
  firma: {
    logoKey: "firma",
    title: "SARA FIRMA DIGITAL",
    subtitle: "Certificación Electrónica .P12",
    href: "/facturacion-electronica",
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.firma || "/images/sara-firma.png",
    accentText: "text-amber-400",
    hoverText: "group-hover:text-amber-400",
    dropShadow: "drop-shadow-[0_4px_16px_rgba(245,158,11,0.28)]",
  },
}

export interface ModuleBrandLogoProps {
  modulo: ModuloBrandKey
  size?: "sm" | "md" | "lg"
  showBackToHolding?: boolean
  customHref?: string
  customTitle?: string
  customSubtitle?: string
  className?: string
}

export default function ModuleBrandLogo({
  modulo,
  size = "md",
  showBackToHolding = true,
  customHref,
  customTitle,
  customSubtitle,
  className,
}: ModuleBrandLogoProps) {
  const meta = MODULE_BRAND_CATALOG[modulo] || MODULE_BRAND_CATALOG.grupo_sara
  const [logoUrl, setLogoUrl] = useState<string>(meta.fallbackLogo)

  useEffect(() => {
    let active = true
    setLogoUrl(meta.fallbackLogo)

    // 1. Consulta desde servicio unificado de configuración
    getLogosEmpresa()
      .then((logos) => {
        if (!active || !logos) return
        const resolved = logos[meta.logoKey]
        if (resolved && resolved.trim() !== "") {
          setLogoUrl(resolved)
        }
      })
      .catch(() => {})

    // 2. Sincronización directa con base de datos (parametros_globales y configuracion_empresa)
    const syncDirectFromDb = async () => {
      try {
        const supabase = createClient()
        const [{ data: paramData }, { data: configData }] = await Promise.all([
          supabase.from("parametros_globales").select("indirectos_default").eq("id", 1).maybeSingle(),
          supabase.from("configuracion_empresa").select("logo_url").limit(1).maybeSingle(),
        ])

        if (!active) return
        const dbLogos = paramData?.indirectos_default?.logos_servicios || {}
        const candidate = dbLogos[meta.logoKey]

        if (candidate && typeof candidate === "string" && candidate.trim() !== "" && candidate !== "null") {
          setLogoUrl(candidate.trim())
        } else if (modulo === "grupo_sara" && configData?.logo_url) {
          setLogoUrl(configData.logo_url)
        }
      } catch {
        // Fallback silencioso a logo por defecto del módulo
      }
    }

    syncDirectFromDb()

    return () => {
      active = false
    }
  }, [modulo, meta.logoKey, meta.fallbackLogo])

  const imgSizeClass =
    size === "sm"
      ? "h-9 md:h-10"
      : size === "lg"
        ? "h-12 md:h-14"
        : "h-10 md:h-12"

  const titleSizeClass =
    size === "sm"
      ? "text-xs sm:text-sm"
      : size === "lg"
        ? "text-base sm:text-lg"
        : "text-sm"

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4 shrink-0", className)}>
      {showBackToHolding && modulo !== "grupo_sara" && (
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400 hover:text-white transition-colors duration-200 ease-out uppercase tracking-widest pr-3.5 border-r border-white/10"
          title="Volver a Grupo SARA Matriz"
        >
          <ChevronLeft size={14} className="text-slate-400" />
          <span>Grupo SARA</span>
        </Link>
      )}

      <Link
        href={customHref || meta.href}
        className="relative flex items-center gap-3 group focus:outline-none"
      >
        <img
          src={logoUrl || meta.fallbackLogo}
          alt={`${customTitle || meta.title} Logo`}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            if (!target.src.endsWith(meta.fallbackLogo)) {
              target.src = meta.fallbackLogo
            }
          }}
          className={cn(
            "w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-105 filter shrink-0",
            meta.dropShadow,
            imgSizeClass
          )}
        />
        <div className="flex flex-col text-left">
          <span
            className={cn(
              "font-display font-extrabold tracking-tight text-white transition-colors duration-200 uppercase leading-tight",
              meta.hoverText,
              titleSizeClass
            )}
          >
            {customTitle || meta.title}
          </span>
          <span
            className={cn(
              "font-mono text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5",
              meta.accentText
            )}
          >
            {customSubtitle || meta.subtitle}
          </span>
        </div>
      </Link>
    </div>
  )
}
