"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if the splash screen has already been seen in this session
    const hasSeenSplash = sessionStorage.getItem("sara_splash_seen")
    
    if (hasSeenSplash) {
      setIsVisible(false)
    } else {
      // Hide automatically after 1.5 seconds
      const timer = setTimeout(() => {
        handleSkip()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSkip = () => {
    setIsVisible(false)
    sessionStorage.setItem("sara_splash_seen", "true")
  }

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!isMounted) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
          style={{ perspective: 1200 }}
        >
          {/* Logo Giratorio en 360 con Ilusión 3D */}
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="relative w-48 h-48 md:w-64 md:h-64 mb-12 transform-style-3d"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image 
              src="/images/logo-3d-blanco.png"
              alt="SARA Constructora Logo 3D"
              fill
              className="object-contain drop-shadow-2xl"
              style={{ backfaceVisibility: "visible", transform: "translateZ(50px)" }}
              priority
            />
          </motion.div>

          {/* Línea de carga animada */}
          <div className="w-48 h-px bg-gray-200 relative overflow-hidden mb-12">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 left-0 w-1/2 bg-brand-sage"
            />
          </div>

          {/* Botón Saltar */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={handleSkip}
            className="text-gray-400 hover:text-brand-dark text-sm tracking-[0.2em] uppercase font-bold transition-colors pb-1 border-b border-transparent hover:border-brand-dark"
          >
            Saltar Intro
          </motion.button>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
