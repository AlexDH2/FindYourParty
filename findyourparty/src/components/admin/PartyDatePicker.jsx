import { useState, useRef, useEffect } from "react"

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const WEEKDAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]

export default function PartyDatePicker({ value, onChange, placeholder = "Seleccionar fecha" }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Desglosar la fecha actual seleccionada
  const initialDate = value ? new Date(value + "T00:00:00") : new Date()
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || 2026)
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() || 8)

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Navegación de meses
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  // Cálculos de cuadrícula de días
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  // Días del mes anterior
  const prevMonthDays = []
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push({ day: daysInPrevMonth - i, type: "prev" })
  }

  // Días del mes actual
  const currentMonthDays = []
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    currentMonthDays.push({ day: i, type: "current" })
  }

  // Días del siguiente mes para completar 35 o 42 casillas
  const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length
  const nextMonthDaysCount = totalDaysSoFar > 35 ? 42 - totalDaysSoFar : 35 - totalDaysSoFar
  const nextMonthDays = []
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push({ day: i, type: "next" })
  }

  const calendarGrid = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  // Formatear selección y emitir valor YYYY-MM-DD
  const handleSelectDay = (item) => {
    let targetYear = viewYear
    let targetMonth = viewMonth

    if (item.type === "prev") {
      if (viewMonth === 0) {
        targetMonth = 11
        targetYear = viewYear - 1
      } else {
        targetMonth = viewMonth - 1
      }
    } else if (item.type === "next") {
      if (viewMonth === 11) {
        targetMonth = 0
        targetYear = viewYear + 1
      } else {
        targetMonth = viewMonth + 1
      }
    }

    const m = String(targetMonth + 1).padStart(2, "0")
    const d = String(item.day).padStart(2, "0")
    const formatted = `${targetYear}-${m}-${d}`

    onChange(formatted)
    setIsOpen(false)
  }

  const isSelected = (item) => {
    if (!value || item.type !== "current") return false
    const [y, m, d] = value.split("-").map(Number)
    return y === viewYear && m === viewMonth + 1 && d === item.day
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Botón trigger que simula input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 rounded-xl p-2 text-[11px] text-left text-zinc-200 flex items-center justify-between transition-all group"
      >
        <span className={value ? "text-zinc-100 font-bold" : "text-zinc-500"}>
          {value || placeholder}
        </span>
        <span className="text-sm group-hover:scale-110 transition-transform">📅</span>
      </button>

      {/* Popover del Calendario Emergente */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-[#09090d]/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-4 shadow-[0_12px_40px_rgba(236,72,153,0.25)] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header con Month, Year y Flechas */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-zinc-900/90 text-white font-black text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 outline-none cursor-pointer hover:border-pink-500"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-zinc-900/90 text-white font-black text-xs px-2 py-1.5 rounded-xl border border-zinc-700 outline-none cursor-pointer hover:border-purple-500"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-purple-600/30 text-zinc-300 hover:text-pink-400 text-xs transition-colors border border-zinc-800"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-purple-600/30 text-zinc-300 hover:text-pink-400 text-xs transition-colors border border-zinc-800"
              >
                ›
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[10px] font-black text-lime-400/80 uppercase">
                {w}
              </span>
            ))}
          </div>

          {/* Grilla de números */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarGrid.map((item, idx) => {
              const active = isSelected(item)
              const isOtherMonth = item.type !== "current"

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 ${
                    active
                      ? "bg-gradient-to-r from-pink-500 via-purple-500 to-lime-400 text-black font-[1000] scale-110 shadow-lg shadow-pink-500/40"
                      : isOtherMonth
                      ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50"
                      : "text-zinc-200 hover:bg-purple-600/20 hover:text-pink-300"
                  }`}
                >
                  {item.day}
                </button>
              )
            })}
          </div>

          {/* Pie rápido: Hoy */}
          <div className="mt-3 pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px]">
            <button
              type="button"
              onClick={() => {
                const now = new Date()
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
                onChange(todayStr)
                setIsOpen(false)
              }}
              className="text-pink-400 hover:text-pink-300 font-bold"
            >
              ⚡ Seleccionar Hoy
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              Cerrar
            </button>
          </div>

        </div>
      )}
    </div>
  )
}