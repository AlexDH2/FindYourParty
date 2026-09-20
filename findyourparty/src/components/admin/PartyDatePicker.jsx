import { useState, useRef, useEffect } from "react"

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const WEEKDAYS = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"]

export default function PartyDatePicker({ value, onChange, placeholder = "Seleccionar fecha" }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const wheelTimeoutRef = useRef(null)
  const touchStartYRef = useRef(0)

  // Desglosar fecha inicial
  const initialDate = value ? new Date(value + "T00:00:00") : new Date()
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || 2026)
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() || 8)

  // Sincronizar si cambia el valor externo
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number)
      if (y && m) {
        setViewYear(y)
        setViewMonth(m - 1)
      }
    }
  }, [value])

  // Cerrar al hacer clic fuera del calendario
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

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(prev => prev - 1)
    } else {
      setViewMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(prev => prev + 1)
    } else {
      setViewMonth(prev => prev + 1)
    }
  }

  // ⚡ Cambiar de mes con la rueda del ratón (Scroll)
  const handleWheelScroll = (e) => {
    e.stopPropagation()

    if (wheelTimeoutRef.current) return
    wheelTimeoutRef.current = setTimeout(() => {
      wheelTimeoutRef.current = null
    }, 180)

    if (e.deltaY > 0) {
      handleNextMonth() // Scroll abajo -> siguiente mes
    } else if (e.deltaY < 0) {
      handlePrevMonth() // Scroll arriba -> mes anterior
    }
  }

  // Deslizar con el dedo en pantallas táctiles
  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY
    if (Math.abs(deltaY) > 35) {
      if (deltaY > 0) handleNextMonth()
      else handlePrevMonth()
    }
  }

  // Cálculos de cuadrícula de días
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  const prevMonthDays = []
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push({ day: daysInPrevMonth - i, type: "prev" })
  }

  const currentMonthDays = []
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    currentMonthDays.push({ day: i, type: "current" })
  }

  const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length
  const nextMonthDaysCount = totalDaysSoFar > 35 ? 42 - totalDaysSoFar : 35 - totalDaysSoFar
  const nextMonthDays = []
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push({ day: i, type: "next" })
  }

  const calendarGrid = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

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

  const isToday = (item) => {
    if (item.type !== "current") return false
    const now = new Date()
    return (
      item.day === now.getDate() &&
      viewMonth === now.getMonth() &&
      viewYear === now.getFullYear()
    )
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-purple-500/50 rounded-xl p-3 text-sm font-bold text-left text-white flex items-center justify-between transition-all group cursor-pointer shadow-inner"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-pink-500 group-hover:scale-110 transition-transform text-base">📅</span>
          <span className={value ? "text-zinc-100" : "text-zinc-500 font-normal"}>
            {value ? `${value}` : placeholder}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono group-hover:text-pink-400 uppercase tracking-wider">
          {isOpen ? "Cerrar" : "Elegir"}
        </span>
      </button>

      {isOpen && (
        <div
          onWheel={handleWheelScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="absolute left-0 top-full mt-2 z-50 w-80 bg-[#0c0c12]/95 backdrop-blur-2xl border border-purple-500/40 rounded-3xl p-5 shadow-[0_15px_50px_rgba(236,72,153,0.3)] animate-in fade-in zoom-in-95 duration-200 select-none"
        >
          <div className="relative z-10 space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="bg-zinc-900 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 outline-none cursor-pointer hover:border-pink-500 transition-colors"
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
                  className="bg-zinc-900 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 outline-none cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {[2025, 2026, 2027, 2028, 2029].map((y) => (
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
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-purple-600/40 text-zinc-300 hover:text-pink-400 text-sm font-bold transition-all border border-zinc-800"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-purple-600/40 text-zinc-300 hover:text-pink-400 text-sm font-bold transition-all border border-zinc-800"
                >
                  ›
                </button>
              </div>
            </div>

            <p className="text-[9px] font-mono text-zinc-500 text-center tracking-wider uppercase">
              ⚡ Rueda del ratón para cambiar de mes
            </p>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2.5">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[10px] font-black text-lime-400 tracking-wider">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarGrid.map((item, idx) => {
              const active = isSelected(item)
              const todayMark = isToday(item)
              const isOtherMonth = item.type !== "current"

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 relative cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-pink-500 via-purple-600 to-lime-400 text-black font-[1000] scale-110 shadow-lg shadow-pink-500/50 z-10"
                      : isOtherMonth
                      ? "text-zinc-700 hover:text-zinc-400 hover:bg-zinc-900/40"
                      : "text-zinc-200 hover:bg-purple-600/30 hover:text-pink-300 hover:scale-105"
                  }`}
                >
                  {item.day}
                  {todayMark && !active && (
                    <span className="absolute bottom-1 w-1 h-1 bg-lime-400 rounded-full animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-850 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => {
                onChange("")
                setIsOpen(false)
              }}
              className="text-zinc-500 hover:text-red-400 text-[11px] font-bold uppercase transition-colors"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date()
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
                onChange(todayStr)
                setIsOpen(false)
              }}
              className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-lg text-[11px] font-black uppercase transition-colors"
            >
              ⚡ Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}