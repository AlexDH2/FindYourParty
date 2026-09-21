import { useParams, Link, useNavigate } from "react-router-dom"
import { useContext, useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { EventContext } from "../context/EventContext"
import { parseNewPricesJsonString, getActiveTicketStageAndPrice } from "../utils/priceUtils"
import { buildWhatsAppUrl, sanitizeQuantity } from "../utils/whatsapp"
import Navbar from "../components/Navbar"
import EventHero from "../components/event/EventHero"
import Countdown from "../components/event/Countdown"
import PromoBanner from "../components/event/PromoBanner"
import { usePublicEvent } from "../queries"

function EventDetails() {
  const { slug } = useParams()
  const { createReservation } = useContext(EventContext) || {};
  const { data: event, isLoading } = usePublicEvent(slug);

  const [quantity, setQuantity] = useState(1)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [isReserving, setIsReserving] = useState(false)
  const [reserveError, setReserveError] = useState(null)

  // Obtener tickets activos
  const tickets = useMemo(() => {
    if (!event) return [];
    
    const parsedPrices = parseNewPricesJsonString(event.prices_json);
    const currentDate = new Date();

    const ticketList = parsedPrices.map(ticketType => {
      const activeStage = getActiveTicketStageAndPrice(ticketType, currentDate);
      
      return {
        id: ticketType.name.toLowerCase().replace(/\s/g, '_'),
        name: ticketType.name,
        price: activeStage?.price || 0,
        stageName: activeStage?.stageName || 'No disponible',
        end_date: activeStage?.end_date || null,
        description: ticketType.description || 'Entrada para el evento.',
        features: ticketType.features || [],
        stock: 100,
      };
    }).filter(t => t.price > 0);

    return ticketList;
  }, [event]);

  // Derivar ticket seleccionado con fallback al primer ticket disponible
  const selectedTicket = useMemo(() => {
    if (tickets.length === 0) return null;
    const found = tickets.find(t => t.id === selectedTicketId);
    return found || tickets[0];
  }, [tickets, selectedTicketId]);

  // Sincronizar selectedTicketId cuando cambian los tickets (e.g. primer carga)
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] text-white">
        <Navbar />
        <div className="animate-pulse flex flex-col pt-32 px-6 max-w-7xl mx-auto gap-8">
          <div className="h-[40vh] bg-zinc-900 rounded-3xl w-full"></div>
          <div className="h-10 bg-zinc-900 rounded-xl w-1/3"></div>
          <div className="h-40 bg-zinc-900 rounded-xl w-full"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center">
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] mb-8">Evento no encontrado</p>
        <Link to="/" className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-8 py-4 rounded-2xl uppercase font-black tracking-widest hover:text-white transition-all mt-4">
          Volver a Cartelera
        </Link>
      </div>
    )
  }

  // Crear reserva y abrir WhatsApp con datos del RPC
  async function handleReserve() {
    if (!selectedTicket) {
      alert("Por favor, selecciona un tipo de entrada.");
      return;
    }

    setIsReserving(true)
    setReserveError(null)

    try {
      // Llamar al RPC; devuelve {id, ticket_type, ticket_stage, unit_price, quantity, total}
      const result = await createReservation(
        event.id,
        selectedTicket.name,
        selectedTicket.stageName,
        sanitizeQuantity(quantity)
      )

      // Construir mensaje de WhatsApp exclusivamente con datos del RPC
      const rpcData = result || {}
      const message =
        `Hola FYP! 👋 Quiero reservar para el evento *${event.title}*.\n\n` +
        `🎟️ *Entrada:* ${rpcData.ticket_type || selectedTicket.name}\n` +
        `✨ *Etapa:* ${rpcData.ticket_stage || selectedTicket.stageName}\n` +
        `💰 *Precio unitario:* S/${Number(rpcData.unit_price || 0).toFixed(2)}\n` +
        `🔢 *Cantidad:* ${rpcData.quantity || quantity}\n` +
        `💸 *Total:* S/${Number(rpcData.total || 0).toFixed(2)}\n\n` +
        `Mi reserva ID: ${rpcData.id || "pendiente"}\n` +
        `Envíame los datos para confirmar la reserva al toque.`

      const url = buildWhatsAppUrl({
        phone: event.whatsapp,
        text: message,
      })
      window.open(url, "_blank")
    } catch (err) {
      console.error("Error al reservar:", err)
      setReserveError("Error al crear la reserva. Intenta de nuevo.")
    } finally {
      setIsReserving(false)
    }
  }

  return (
    <div className="bg-[#030303] text-white min-h-screen pb-20">
      <Navbar />
      
      <EventHero event={event} />

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-7 space-y-16">

            {/* DESCRIPTION & INFO */}
            <section className="bg-zinc-900/20 rounded-[2.5rem] p-10 border border-zinc-900 backdrop-blur-md">
               <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Sobre la Experiencia</h3>
               <div className="prose prose-invert max-w-none text-zinc-400 font-medium leading-relaxed">
                 <p>{event.description || "Prepárate para una noche inolvidable en el corazón de la ciudad. Los mejores DJs, ambiente exclusivo y la mejor producción visual te esperan."}</p>
                 <ul className="mt-8 grid grid-cols-2 gap-4 list-none p-0">
                    <li className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-850">
                       <span className="text-purple-500 block mb-1">👗 Dresscode</span>
                       <span className="text-white text-sm font-bold uppercase tracking-wider">{event.dresscode || "No especificado"}</span>
                    </li>
                    <li className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-850">
                       <span className="text-cyan-400 block mb-1">🔞 Edad</span>
                       <span className="text-white text-sm font-bold uppercase tracking-wider">{event.min_age || "Todas las edades"}</span>
                    </li>
                    <li className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-850">
                       <span className="text-pink-500 block mb-1">⏰ Apertura</span>
                       <span className="text-white text-sm font-bold uppercase tracking-wider">{event.opening_time || "No especificado"}</span>
                    </li>
                    <li className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-850">
                       <span className="text-amber-400 block mb-1">📍 Ubicación</span>
                       <span className="text-white text-sm font-bold uppercase tracking-wider">{event.location}</span>
                    </li>
                 </ul>
                 {event.organizer && <p className="text-zinc-400 text-sm mt-8">Organizado por: <span className="font-bold text-white">{event.organizer}</span></p>}
               </div>
            </section>

            {/* GALERÍA */}
            {event.gallery_images && event.gallery_images.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-2xl font-black uppercase tracking-tight">Galería</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.gallery_images.map((img, i) => (
                    <div key={i} className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
                      <img src={img.url || img} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MAPA */}
            <section className="space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tight">Mapa del Evento</h3>
                <div className="h-[400px] bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden relative group">
                   {event.local_distribution_image ? (
                     <img src={event.local_distribution_image} alt="Mapa del local" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     <div className="relative w-full h-full">
                       <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" alt="Mapa Genérico" className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-5xl mb-4 text-white drop-shadow-lg">📍</span>
                          <p className="text-sm font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Mapa de Ubicación</p>
                          {event.maps && <p className="text-xs text-zinc-300 mt-2 font-bold drop-shadow-md">Toca el botón abajo para abrir Maps</p>}
                       </div>
                     </div>
                   )}
                </div>
              {event.maps && (
                <div className="flex justify-center mt-4">
                  <a href={event.maps} target="_blank" rel="noreferrer" className="bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition text-sm flex items-center gap-2">
                    📍 Cómo llegar
                  </a>
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR: CHECKOUT & COUNTDOWN */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* COUNTDOWN CARD */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 backdrop-blur-xl">
               <h4 className="text-center text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">Iniciamos en</h4>
               <Countdown targetDate={event.date} />
            </div>

            {/* PROMO BANNER */}
            {event.promo_active && event.promo_image_url && (
              <PromoBanner 
                imageUrl={event.promo_image_url} 
                expiresAt={event.promo_expires_at} 
                onClick={() => document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' })}
              />
            )}

            {/* CHECKOUT CARD */}
            <div id="tickets-section" className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl sticky top-32">
              <div className="mb-8">
                <h2 className="text-3xl font-[1000] uppercase tracking-tighter mb-2">Reserva <span className="text-purple-500">Fast</span></h2>
                <p className="text-zinc-500 text-xs font-medium">Finaliza tu compra por WhatsApp al toque.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Zona</span>
                    {/* Selector de tipo de entrada */}
                    <select
                      value={selectedTicket?.id || ''}
                      onChange={(e) => setSelectedTicketId(e.target.value)}
                      className="w-auto bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer text-white"
                    >
                      {tickets.length === 0 && <option value="">No hay entradas disponibles</option>}
                      {tickets.map(ticket => (
                        <option key={ticket.id} value={ticket.id}>
                          {ticket.name} (S/.{Number(ticket.price).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inversión</span>
                    <span className="text-purple-400 font-black font-mono text-xl">S/{selectedTicket?.price || 0}</span>
                  </div>
                  
                  {/* FEATURES */}
                  {selectedTicket && selectedTicket.features && selectedTicket.features.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-2">
                      {selectedTicket.features.map((f, i) => (
                        <span key={i} className="bg-purple-900/30 text-purple-300 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3 ml-2">¿Cuántos pases?</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                      <option key={n} value={n} className="bg-zinc-950">{n} {n === 1 ? 'Entrada' : 'Entradas'}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Estimado</p>
                      <p className="text-4xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-mono">
                        S/{(selectedTicket?.price || 0) * quantity}
                      </p>
                   </div>
                </div>

                {reserveError && (
                  <p className="text-red-400 text-xs font-bold">{reserveError}</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReserve}
                  disabled={isReserving || tickets.length === 0}
                  className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="text-lg">🚀</span> {isReserving ? "Procesando..." : "Comprar por WhatsApp"}
                </motion.button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default EventDetails
