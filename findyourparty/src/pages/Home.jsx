import { useContext, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import EventCard from "../components/EventCard"
import Navbar from "../components/Navbar"
import { getMinActivePrice, parseNewPricesJsonString } from "../utils/priceUtils"
import { usePublicEvents } from "../queries"

export default function Home() {
  const [page, setPage] = useState(1)
  const [allEvents, setAllEvents] = useState([])

  const { data: currentPageData, isLoading, isError } = usePublicEvents(page)

  // Acumular eventos de cada página sin duplicados
  useEffect(() => {
    if (currentPageData && currentPageData.length > 0) {
      setAllEvents((prev) => {
        const existingIds = new Set(prev.map((e) => e.id))
        const newEvents = currentPageData.filter((e) => !existingIds.has(e.id))
        return [...prev, ...newEvents]
      })
    }
  }, [currentPageData])

  const [selectedCategory, setSelectedCategory] = useState("Todos")

  // Dynamically derive categories
  const categories = ["Todos", ...new Set(allEvents.map(e => {
    const cat = e.category || e.genre || "";
    return cat.trim() ? cat.trim() : "Otros";
  }))]

  const filteredEvents = allEvents.filter((event) => {
    if (selectedCategory === "Todos") return true
    const cat = (event.category || event.genre || "Otros");
    return cat.toLowerCase() === selectedCategory.toLowerCase();
  })

  let gridClasses = "grid gap-8"
  if (filteredEvents.length === 1) {
    gridClasses += " grid-cols-1 max-w-md mx-auto"
  } else if (filteredEvents.length === 2) {
    gridClasses += " grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
  } else {
    gridClasses += " grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }

  const getMinPriceDisplay = (event) => {
    if (!event) return "0"
    try {
      const parsed = parseNewPricesJsonString(event.prices_json)
      const min = getMinActivePrice(parsed)
      return min || event.price || "0"
    } catch {
      return event.price || "0"
    }
  }

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

  const loadMore = () => setPage((p) => p + 1)

  // Si la última página devolvió 12, probablemente hay más
  const hasMore = currentPageData && currentPageData.length === 12

  const featuredEvent = allEvents.find(e => e.featured === true) || allEvents[0]

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center bg-zinc-950">
        {featuredEvent && (
          <>
            <img
              src={featuredEvent.image || "/FYP_banner_default.png"}
              alt={featuredEvent.title || "Find Your Party"}
              style={{
                objectPosition: featuredEvent.banner_position || "50% 20%",
                transform: `scale(${featuredEvent.banner_zoom || 1})`,
                transformOrigin: featuredEvent.banner_position || "50% 20%",
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen transition-all duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          </>
        )}
        <div className="relative max-w-7xl mx-auto px-6 pt-32 w-full z-20 flex flex-col min-h-screen justify-center">
          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs uppercase font-black tracking-[0.2em] px-4 py-2 rounded-full w-fit">
            {featuredEvent ? "🔥 EVENTO DE LA SEMANA" : "✨ LIMA NIGHTLIFE"}
          </span>
          <h1 className="text-5xl md:text-8xl font-[1000] tracking-tighter mt-6 max-w-4xl leading-none uppercase bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-sm">
            {featuredEvent?.title || "EVENTO DE LA SEMANA"}
          </h1>
          {featuredEvent ? (
            <div className="mt-6 max-w-xl">
              {(() => {
                const { day, month, weekday } = formatCardDate(featuredEvent.date);
                return (
                  <p className="text-zinc-400 text-lg md:text-xl font-medium tracking-wide">
                    📍 {featuredEvent.location} • 📅 {day} {month} • {weekday}
                  </p>
                );
              })()}
              <p className="text-cyan-400 font-black text-3xl mt-4 tracking-tight">
                Desde S/{getMinPriceDisplay(featuredEvent)}
              </p>
            </div>
          ) : (
            <p className="text-zinc-400 text-lg md:text-xl max-w-xl mt-6 font-medium">
              Próximamente. Estamos preparando las mejores experiencias nocturnas de Lima. ¡Atento a la cartelera!
            </p>
          )}
          <div className="mt-10 flex gap-4">
            {featuredEvent ? (
              <Link
                to={`/evento/${featuredEvent.slug || featuredEvent.id}`}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition tracking-wide uppercase text-xs"
              >
                Ver Zonas y Precios
              </Link>
            ) : (
              <a href="#eventos" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition tracking-wide uppercase text-xs">
                Explorar Fechas
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Cartelera Section */}
      <section id="eventos" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Cartelera Actual</h2>
            <p className="text-zinc-500 text-sm mt-2">Filtra tus eventos favoritos en Lima</p>
          </div>
          <div className="flex gap-2 bg-zinc-900/60 border border-zinc-800/80 p-1.5 rounded-2xl overflow-x-auto backdrop-blur-md">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === category ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={gridClasses}>
          {isLoading && allEvents.length === 0 ? (
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-zinc-900 rounded-[2rem] w-full aspect-[4/5]" />
              ))}
            </div>
          ) : isError && allEvents.length === 0 ? (
            <div className="col-span-full text-center py-20 text-red-400">Error al cargar eventos. Intenta de nuevo.</div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div className="transition-transform hover:scale-[1.01] block" key={event.id}>
                <EventCard event={event} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/30">
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-zinc-400">Próximamente</h3>
              <p className="text-zinc-500 text-sm">No hay juergas programadas en esta categoría por ahora.</p>
            </div>
          )}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? "Cargando..." : "Cargar más"}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}