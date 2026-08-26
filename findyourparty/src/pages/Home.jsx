import { useContext, useState } from "react"
import { Link } from "react-router-dom"
import { EventContext } from "../context/EventContext"
import EventCard from "../components/EventCard" // Assuming EventCard is the component for individual events
import Navbar from "../components/Navbar" // Import Navbar component
import { getMinActivePrice, parseNewPricesJsonString } from "../utils/priceUtils"

export default function Home() {
  const { events = [] } = useContext(EventContext) || {}

  const activeEvents = (events || []).filter((event) => {
    if (!event) return false
    const status = event.lifecycleStatus ? event.lifecycleStatus.toLowerCase() : "activo";
    // Filter by publication_status
    // Solo mostrar eventos publicados y activos
    return ["activo", "active", "periodo_de_gracia", "grace"].includes(status) &&
           event.publication_status === 'published';

  })

  const featuredEvent = activeEvents.find((event) => event.featured) || activeEvents[0]

  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const filteredEvents = activeEvents.filter((event) =>
    selectedCategory === "Todos" || event.category === selectedCategory
  )

  // Determine grid classes based on the number of filtered events
  let gridClasses = "grid gap-8";
  if (filteredEvents.length === 1) {
    gridClasses += " grid-cols-1 max-w-md mx-auto"; // Center single card
  } else if (filteredEvents.length === 2) {
    gridClasses += " grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"; // Center two cards
  } else {
    gridClasses += " grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // Default grid for 3 or more
  }

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center bg-zinc-950">
        <img
          src={featuredEvent?.image || "/FYP_banner_default.png"}
          alt={featuredEvent?.title || "Find Your Party"}
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-32 w-full z-20 flex flex-col min-h-screen justify-center">
          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs uppercase font-black tracking-[0.2em] px-4 py-2 rounded-full w-fit">
            {featuredEvent ? "🔥 EVENTO DE LA SEMANA" : "✨ LIMA NIGHTLIFE"}
          </span>
          <h1 className="text-5xl md:text-8xl font-[1000] tracking-tighter mt-6 max-w-4xl leading-none uppercase bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-sm">
            {featuredEvent?.title || "EVENTO DE LA SEMANA"}
          </h1>
          {featuredEvent ? (
            <div className="mt-6 max-w-xl">
              <p className="text-zinc-400 text-lg md:text-xl font-medium tracking-wide">
                📍 {featuredEvent.location} • 📅 {featuredEvent.date}
              </p>
              <p className="text-cyan-400 font-black text-3xl mt-4 tracking-tight">
                Desde S/{getMinActivePrice(parseNewPricesJsonString(featuredEvent.prices_json))}
              </p>
            </div>
          ) : (
            <p className="text-zinc-400 text-lg md:text-xl max-w-xl mt-6 font-medium">
              Próximamente. Estamos preparando las mejores experiences nocturnas de Lima. ¡Atento a la cartelera!
            </p>
          )}
          <div className="mt-10 flex gap-4">
            {featuredEvent ? (
              <Link
                to={`/evento/${featuredEvent.slug}`} // Usar slug para el enlace
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition tracking-wide uppercase text-xs"
              >
                Ver Zonas y Precios
              </Link>
            ) : (
              <a
                href="#eventos"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition tracking-wide uppercase text-xs"
              >
                Explorar Fechas
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Eventos Section */}
      <section id="eventos" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Cartelera Actual</h2>
            <p className="text-zinc-500 text-sm mt-2">Filtra tus eventos favoritos en Lima</p>
          </div>
          <div className="flex gap-2 bg-zinc-900/60 border border-zinc-800/80 p-1.5 rounded-2xl overflow-x-auto backdrop-blur-md">
            {["Todos", "Reggaeton", "Techno", "Salsa", "Electrónica"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={gridClasses}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div className="transition-transform hover:scale-[1.01] block" key={event.id}> {/* Changed Link to div */}
                <EventCard event={event} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/30">
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-zinc-400">Próximamente</h3>
              <p className="text-zinc-600 text-sm">No hay juergas programadas en esta categoría por ahora.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t border-zinc-900 py-20 text-center bg-zinc-950/20">
        <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          FIND YOUR PARTY
        </h2>
        <p className="text-zinc-600 mt-3 text-xs uppercase tracking-[0.3em]">Descubre. Reserva. Disfruta.</p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-6 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition text-sm"
          >
            Instagram
          </a>
        </div>
      </footer>
    </div>
  )
}