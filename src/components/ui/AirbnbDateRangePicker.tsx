"use client"
import React, { useState, useRef, useEffect, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles, Check } from "lucide-react"

interface AirbnbDateRangePickerProps {
  checkIn: string
  checkOut: string
  onChange: (checkIn: string, checkOut: string) => void
  compact?: boolean
  className?: string
}

function parseYMD(str: string): Date {
  if (!str) return new Date()
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function formatYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatDisplayDate(str: string): string {
  if (!str) return "Seleccionar"
  const d = parseYMD(str)
  return d.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]

export default function AirbnbDateRangePicker({
  checkIn,
  checkOut,
  onChange,
  compact = false,
  className = ""
}: AirbnbDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"checkIn" | "checkOut">("checkIn")
  
  // Mes visualizado
  const initialDate = checkIn ? parseYMD(checkIn) : new Date()
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear())
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth())
  
  // Estado temporal de selección dentro del popover
  const [tempCheckIn, setTempCheckIn] = useState<string>(checkIn)
  const [tempCheckOut, setTempCheckOut] = useState<string>(checkOut)
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Actualizar estados temporales si cambian los props
  useEffect(() => {
    setTempCheckIn(checkIn)
    setTempCheckOut(checkOut)
    if (checkIn) {
      const d = parseYMD(checkIn)
      setCurrentYear(d.getFullYear())
      setCurrentMonth(d.getMonth())
    }
  }, [checkIn, checkOut])

  // Noches calculadas
  const nochesCalculadas = useMemo(() => {
    if (!tempCheckIn || !tempCheckOut) return 1
    const d1 = parseYMD(tempCheckIn).getTime()
    const d2 = parseYMD(tempCheckOut).getTime()
    const diff = Math.ceil((d2 - d1) / (1000 * 3600 * 24))
    return diff > 0 ? diff : 1
  }, [tempCheckIn, tempCheckOut])

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  const handleDayClick = (dateStr: string) => {
    if (activeTab === "checkIn") {
      setTempCheckIn(dateStr)
      // Si la salida anterior era menor o igual a la nueva entrada, sugerir día siguiente
      if (!tempCheckOut || dateStr >= tempCheckOut) {
        const nextD = parseYMD(dateStr)
        nextD.setDate(nextD.getDate() + 2)
        const nextStr = formatYMD(nextD)
        setTempCheckOut(nextStr)
        onChange(dateStr, nextStr)
      } else {
        onChange(dateStr, tempCheckOut)
      }
      setActiveTab("checkOut")
    } else {
      // Seleccionando Check-Out
      if (dateStr <= tempCheckIn) {
        // Si seleccionó una fecha anterior, reasignar check-in
        setTempCheckIn(dateStr)
        const nextD = parseYMD(dateStr)
        nextD.setDate(nextD.getDate() + 2)
        const nextStr = formatYMD(nextD)
        setTempCheckOut(nextStr)
        onChange(dateStr, nextStr)
        setActiveTab("checkOut")
      } else {
        setTempCheckOut(dateStr)
        onChange(tempCheckIn, dateStr)
        setIsOpen(false)
      }
    }
  }

  // Preajustes rápidos
  const applyPresetWeekend = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    // Buscar próximo viernes
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
    const friday = new Date(today)
    friday.setDate(today.getDate() + daysUntilFriday)
    const sunday = new Date(friday)
    sunday.setDate(friday.getDate() + 2)

    const inStr = formatYMD(friday)
    const outStr = formatYMD(sunday)
    setTempCheckIn(inStr)
    setTempCheckOut(outStr)
    onChange(inStr, outStr)
    setCurrentYear(friday.getFullYear())
    setCurrentMonth(friday.getMonth())
    setIsOpen(false)
  }

  const applyPresetNextWeek = () => {
    const today = new Date()
    const nextMonday = new Date(today)
    const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7
    nextMonday.setDate(today.getDate() + daysUntilMonday)
    const nextSunday = new Date(nextMonday)
    nextSunday.setDate(nextMonday.getDate() + 6)

    const inStr = formatYMD(nextMonday)
    const outStr = formatYMD(nextSunday)
    setTempCheckIn(inStr)
    setTempCheckOut(outStr)
    onChange(inStr, outStr)
    setCurrentYear(nextMonday.getFullYear())
    setCurrentMonth(nextMonday.getMonth())
    setIsOpen(false)
  }

  // Generador de cuadrícula para un mes específico
  const renderMonthGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const startingDay = firstDay.getDay() // 0 = Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const todayStr = formatYMD(new Date())

    const days = []
    // Días vacíos al inicio
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d)
      const dateStr = formatYMD(dateObj)
      const isPast = dateStr < todayStr
      const isCheckIn = dateStr === tempCheckIn
      const isCheckOut = dateStr === tempCheckOut
      const isInRange = tempCheckIn && tempCheckOut && dateStr > tempCheckIn && dateStr < tempCheckOut
      const isHoverInRange = activeTab === "checkOut" && tempCheckIn && hoverDate && dateStr > tempCheckIn && dateStr <= hoverDate

      days.push(
        <button
          type="button"
          key={dateStr}
          disabled={isPast}
          onClick={() => handleDayClick(dateStr)}
          onMouseEnter={() => !isPast && setHoverDate(dateStr)}
          className={`h-9 w-9 text-xs font-bold rounded-xl transition-all relative flex items-center justify-center cursor-pointer ${
            isPast 
              ? "text-gray-300 cursor-not-allowed"
              : isCheckIn
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-105 z-10"
              : isCheckOut
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-105 z-10"
              : isInRange || isHoverInRange
              ? "bg-amber-100 text-amber-950 rounded-none first:rounded-l-xl last:rounded-r-xl"
              : "text-gray-700 hover:bg-amber-50 hover:text-amber-900"
          }`}
        >
          <span>{d}</span>
          {dateStr === todayStr && !isCheckIn && !isCheckOut && (
            <span className="w-1 h-1 rounded-full bg-amber-500 absolute bottom-1" />
          )}
        </button>
      )
    }

    return (
      <div className="space-y-2">
        <div className="text-center font-extrabold text-sm text-gray-900">
          {MONTH_NAMES[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((name) => (
            <div key={name} className="text-[10px] font-black text-gray-400 py-1 uppercase">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  // Segundo mes a mostrar al lado
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
  const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Botón Disparador Elegante (Reemplaza al input nativo feo) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 bg-gray-50 hover:bg-white border border-gray-200 hover:border-amber-400 rounded-xl transition-all cursor-pointer shadow-sm group"
      >
        {/* Llegada */}
        <div 
          onClick={(e) => {
            e.stopPropagation()
            setActiveTab("checkIn")
            setIsOpen(true)
          }}
          className={`flex-1 px-3 py-1.5 rounded-lg transition-all ${
            isOpen && activeTab === "checkIn" ? "bg-white shadow-sm ring-1 ring-amber-400" : ""
          }`}
        >
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Llegada</span>
          <span className="text-xs font-black text-gray-800 flex items-center gap-1">
            <CalendarIcon size={12} className="text-amber-500 shrink-0" />
            {formatDisplayDate(tempCheckIn)}
          </span>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Salida */}
        <div 
          onClick={(e) => {
            e.stopPropagation()
            setActiveTab("checkOut")
            setIsOpen(true)
          }}
          className={`flex-1 px-3 py-1.5 rounded-lg transition-all ${
            isOpen && activeTab === "checkOut" ? "bg-white shadow-sm ring-1 ring-amber-400" : ""
          }`}
        >
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Salida</span>
          <span className="text-xs font-black text-gray-800 flex items-center gap-1">
            <CalendarIcon size={12} className="text-amber-500 shrink-0" />
            {formatDisplayDate(tempCheckOut)}
          </span>
        </div>

        {/* Badge Noches */}
        <span className="hidden sm:inline-block px-2 py-1 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold shrink-0 mr-1">
          {nochesCalculadas} {nochesCalculadas === 1 ? "noche" : "noches"}
        </span>
      </div>

      {/* POP-OVER DEL CALENDARIO ESTILO AIRBNB OFICIAL */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-200 p-5 md:p-6 w-[94vw] sm:w-[580px] md:w-[640px] left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 animate-fadeIn"
          style={{ maxWidth: "calc(100vw - 20px)" }}
        >
          {/* Header del Calendario con Tabs Llegada / Salida */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>{nochesCalculadas} noche{nochesCalculadas > 1 ? "s" : ""}</span>
                <span className="text-xs font-bold text-gray-400">•</span>
                <span className="text-xs font-semibold text-amber-700">
                  {formatDisplayDate(tempCheckIn)} al {formatDisplayDate(tempCheckOut)}
                </span>
              </h4>
              <p className="text-[11px] text-gray-400">
                Selecciona la fecha de llegada y luego la fecha de salida
              </p>
            </div>

            {/* Selector de pestañas Entrada / Salida */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("checkIn")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "checkIn" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Llegada
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("checkOut")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "checkOut" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Salida
              </button>
            </div>
          </div>

          {/* Navegación de Meses */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-gray-400">Calendario SARA Hospitality</span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Cuadrículas de Meses (Dual en Desktop, Single en Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {renderMonthGrid(currentYear, currentMonth)}
            </div>
            <div className="hidden md:block">
              {renderMonthGrid(nextMonthYear, nextMonthIndex)}
            </div>
          </div>

          {/* Accesos Rápidos (Presets) */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1">Rápido:</span>
              <button
                type="button"
                onClick={applyPresetWeekend}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors cursor-pointer"
              >
                Fin de semana (Vie - Dom)
              </button>
              <button
                type="button"
                onClick={applyPresetNextWeek}
                className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Próxima semana
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const todayStr = formatYMD(new Date())
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 2)
                  const tomStr = formatYMD(tomorrow)
                  setTempCheckIn(todayStr)
                  setTempCheckOut(tomStr)
                  onChange(todayStr, tomStr)
                }}
                className="text-xs text-gray-500 hover:text-gray-900 underline font-semibold px-2 cursor-pointer"
              >
                Reiniciar
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Aplicar Fechas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
