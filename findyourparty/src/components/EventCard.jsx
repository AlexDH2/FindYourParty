import { Link } from "react-router-dom"

export default function EventCard({ event }) {
  if (!event) return null

  // Formato de fecha para el badge superior (ej: 31 OCT • SÁB)
  const formatCardDate = (dateStr) => {
    if (!dateStr) return { day: "--", month: "PRÓX", weekday: "" }
    try {
      const [y, m, d] = dateStr.split("-").map(Number)
      const dateObj = new Date(y, m - 1, d)
      const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"]
      const weekdays = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]
      return {
        day: d,
        month: months[dateObj.getMonth()] || "MES",
        weekday: weekdays[dateObj.getDay()] || ""
      }
    } catch {
      return { day: "--", month: "PRÓX", weekday: "" }
    }
  }

  // Obtener el precio mínimo de las preventas o el precio base
  const getMinPrice = () => {
    try {
      if (event.prices_json) {
        const parsed = typeof event.prices_json === "string" ? JSON.parse(event.prices_json) : event.prices_json
        let min = Infinity
        if (Array.isArray(parsed)) {
          parsed.forEach((ticket) => {
            (ticket.stages || []).forEach((stage) => {
              const p = Number(stage.price)
              if (!isNaN(p) && p > 0 && p < min) min = p
            })
          })
        }
        if (min !== Infinity) return `Desde S/. ${min.toFixed(2)}`
      }
      if (event.price && Number(event.price) > 0) {
        return `Desde S/. ${Number(event.price).toFixed(2)}`
      }
      return "Preventa Disponible"
    } catch {
      return "Entradas Disponibles"
    }
  }

  const { day, month, weekday } = formatCardDate(event.date)
  const destinationUrl = `/evento/${event.slug || event.id}`
  const coverImage = event.image || event.gallery_images?.[0]?.url || "/FYP_banner_default.png"
  
  // Decide badge text based on some logic or default to EN VENTA
  const topBadgeText = "EN VENTA"

  return (
    <Link
      to={destinationUrl}
      className="group relative block w-full bg-zinc-950 border border-zinc-850 hover:border-pink-500/50 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(236,72,153,0.25)]"
    >
      {/* Contenedor de la Imagen / Flyer con Aspect Ratio Vertical */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-zinc-900">
        <img
          src={coverImage}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradiente oscuro inferior para garantizar lectura perfecta */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Badge de Fecha en la esquina superior izquierda */}
        <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 text-center min-w-[56px] shadow-lg group-hover:border-pink-500/40 transition-colors">
          <span className="block text-[10px] font-black uppercase tracking-wider text-pink-400">
            {month}
          </span>
          <span className="block text-2xl font-[1000] text-white leading-none my-0.5">
            {day}
          </span>
          <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            {weekday}
          </span>
        </div>

        {/* Badge de Estado / Categoría en la esquina superior derecha */}
        <div className="absolute top-4 right-4">
          <span className="bg-lime-400/20 backdrop-blur-md border border-lime-400/40 text-lime-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            🔥 {topBadgeText}
          </span>
        </div>

        {/* Información superpuesta en la parte baja de la imagen */}
        <div className="absolute bottom-0 inset-x-0 p-6 space-y-3 z-10">
          
          {/* Título del Evento */}
          <h3 className="text-2xl md:text-3xl font-[1000] uppercase tracking-tight text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:via-purple-400 group-hover:to-lime-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
            {event.title}
          </h3>

          {/* Local / Ubicación */}
          <p className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide">
            <span className="text-pink-500">📍</span>
            <span className="truncate">{event.location || "Lima, Perú"}</span>
          </p>

          {/* Chips informativos */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="bg-zinc-900/80 border border-zinc-800 text-[10px] font-bold text-zinc-400 px-2.5 py-1 rounded-lg">
              🔞 {event.min_age || "+18"}
            </span>
            <span className="bg-zinc-900/80 border border-zinc-800 text-[10px] font-bold text-zinc-400 px-2.5 py-1 rounded-lg">
              ⏰ {event.opening_time || "10:00 PM"}
            </span>
            {event.dresscode && (
              <span className="bg-zinc-900/80 border border-zinc-800 text-[10px] font-bold text-zinc-400 px-2.5 py-1 rounded-lg">
                👗 {event.dresscode}
              </span>
            )}
          </div>

          {/* Fila inferior: Precio y Botón CTA */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
            <div>
              <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">Entradas</span>
              <span className="text-lg font-[1000] text-lime-400 tracking-tight">
                {getMinPrice()}
              </span>
            </div>

            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-purple-700 group-hover:from-pink-400 group-hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center gap-1.5">
              Ver Zonas
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>

        </div>
      </div>
    </Link>
  )
}