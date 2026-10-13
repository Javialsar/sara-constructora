"use client"
import React from "react"
import ModuloIntroSplash from "@/components/ui/ModuloIntroSplash"

interface ConstructoraIntroProps {
  onComplete?: () => void
  forceShow?: boolean
}

export default function ConstructoraIntro({ onComplete, forceShow }: ConstructoraIntroProps) {
  return (
    <ModuloIntroSplash 
      modulo="constructora" 
      forceShow={forceShow}
      onComplete={onComplete}
    />
  )
}
