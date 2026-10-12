import { useParams, Link, useNavigate } from "react-router-dom"
import { useContext, useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { EventContext } from "../context/EventContext"
import { parseNewPricesJsonString, getActiveTicketStageAndPrice } from "../utils/priceUtils"
import { buildWhatsAppUrl, sanitizeQuantity, generateReservationMessage, formatReservationCode } from "../utils/whatsapp"
import Navbar from "../components/Navbar"
import EventHero from "../components/event/EventHero"
import Countdown from "../components/event/Countdown"
import PromoBanner from "../components/event/PromoBanner"
import GalleryLightboxModal from "../components/event/GalleryLightboxModal"
import { getYouTubeEmbedUrl } from "../utils/videoUtils"
import { usePublicEvent } from "../queries"

function EventDetails() {
  const { slug } = useParams()
  const { createReservation } = useContext(EventContext) || {};
  const { data: event, isLoading } = usePublicEvent(slug);

  const [quantity, setQuantity] = useState(1)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [isReserving, setIsReserving] = useState(false)
  const [reserveError, setReserveError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Obtener tickets activos
  const tickets = useMemo(() => {
    if (!event) return [];
    
    const parsedPrices = parseNewPricesJsonString(event.prices_json);
    const currentDate = new Date();

    const ticketList = parsedPrices.map(ticketType => {
      const activeStage = getActiveTicketStageAndPrice(ticketType, currentDate);
      const isStageActive = Boolean(activeStage);
      const stagePrice = isStageActive ? Number(activeStage.price) : 0;
      
      return {
        id: ticketType.name.toLowerCase().replace(/\s/g, '_'),
        name: ticketType.name,
        price: !isNaN(stagePrice) ? stagePrice : 0,
        stageName: activeStage?.stageName || 'General',
        end_date: activeStage?.end_date || null,
        description: ticketType.description || 'Entrada para el evento.',
        features: ticketType.features || [],
        stock: 100,
        isActive: isStageActive,
      };
    }).filter(t => t.isActive);

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
      let rpcData = null
      try {
        if (createReservation) {
          rpcData = await createReservation(
            event.id,
            selectedTicket.name,
            selectedTicket.stageName,
            sanitizeQuantity(quantity)
          )
        }
      } catch (rpcErr) {
        console.warn("createReservation fallback (abriendo WhatsApp):", rpcErr)
      }

      // Generar mensaje estructurado de WhatsApp
      const message = generateReservationMessage({
        event,
        selectedTicket,
        quantity,
        rpcData,
      })

      // Registro de trazabilidad / Lead en el cliente para respaldo
      try {
        const leadRecord = {
          id: rpcData?.id || `lead-${Date.now()}`,
          code: formatReservationCode(rpcData?.id),
          eventId: event.id,
          eventTitle: event.title,
          ticketType: rpcData?.ticket_type || selectedTicket.name,
          ticketStage: rpcData?.ticket_stage || selectedTicket.stageName,
          quantity: rpcData?.quantity || quantity,
          unitPrice: Number(rpcData?.unit_price ?? selectedTicket.price ?? 0),
          total: Number(rpcData?.total ?? ((selectedTicket.price || 0) * quantity)),
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem("fyp_last_reservation", JSON.stringify(leadRecord))
      } catch (storageErr) {
        // silencioso
      }

      const url = buildWhatsAppUrl({
        phone: event.whatsapp,
        text: message,
      })
      window.open(url, "_blank")
    } catch (err) {
      console.error("Error al reservar:", err)
      setReserveError("Error al abrir WhatsApp. Intenta de nuevo.")
    } finally {
      setIsReserving(false)
    }
  }

  return (
    <div className="bg-[#030303] text-white min-h-screen pb-20">
      {lightboxIndex === null && <Navbar />}
      
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

            {/* VIDEO TRAILER / AFTERMOVIE */}
            {event.video_url && getYouTubeEmbedUrl(event.video_url) && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Trailer Oficial</h3>
                  <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    ▶ YouTube
                  </span>
                </div>
                <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
                  <iframe
                    src={getYouTubeEmbedUrl(event.video_url)}
                    title="Trailer del evento"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* GALERÍA */}
            {event.gallery_images && event.gallery_images.length > 0 && (
              <section className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Galería</h3>
                  <p className="text-xs text-zinc-400 mt-1">Toca cualquier foto para verla completa en pantalla completa</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {event.gallery_images.map((img, i) => {
                    const url = img?.url || img
                    const position = img?.position || "50% 50%"
                    const zoom = img?.zoom || 1
                    const label = img?.label || `Flyer ${i + 1}`

                    return (
                      <div
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className="group relative aspect-[4/5] bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 cursor-pointer shadow-lg hover:border-purple-500/50 transition-all duration-300"
                      >
                        <img
                          src={url}
                          alt={label}
                          style={{
                            objectPosition: position,
                            transform: `scale(${zoom})`,
                            transformOrigin: position
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                          <span className="self-end bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-full border border-white/10">
                            🔍 Ampliar
                          </span>
                          <span className="text-xs font-black text-white uppercase tracking-wider drop-shadow-md">
                            {label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
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
            <Countdown targetDate={event.date} />

            {/* PROMO BANNER */}
            {event.promo_active && event.promo_image_url && (
              <PromoBanner 
                imageUrl={event.promo_image_url} 
                expiresAt={event.promo_expires_at} 
                onClick={() => document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' })}
              />
            )}

            {/* CHECKOUT CARD */}
            <div id="tickets-section" className="bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black border border-zinc-800/80 rounded-3xl sm:rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl lg:sticky lg:top-32 relative overflow-hidden">
              {/* Resplandor ambiental de fondo */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-6 sm:mb-8 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter mb-1.5">
                  Reserva <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Fast</span>
                </h2>
                <p className="text-zinc-400 text-xs font-medium">Finaliza tu compra por WhatsApp al toque.</p>
              </div>

              <div className="space-y-6 relative z-10">
                {/* TARJETA DE ZONA Y PRECIO */}
                <div className="bg-zinc-950/90 p-5 sm:p-6 rounded-3xl border border-zinc-800/80 shadow-inner space-y-4">
                  {/* Selector si hay más de 1 tipo de entrada */}
                  {tickets.length > 1 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cambiar Zona</span>
                        <span className="text-[10px] text-zinc-500 font-bold">{tickets.length} disponibles</span>
                      </div>
                      <div className="relative">
                        <select
                          value={selectedTicket?.id || ''}
                          onChange={(e) => setSelectedTicketId(e.target.value)}
                          className="w-full appearance-none bg-zinc-900 border border-zinc-750 hover:border-purple-500/60 rounded-2xl px-4 py-3 pr-10 text-xs sm:text-sm font-bold text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                        >
                          {tickets.map(ticket => {
                            const isFree = Number(ticket.price) === 0;
                            const priceLabel = isFree ? "Gratis (Pase Libre)" : `S/ ${Number(ticket.price).toFixed(2)}`;
                            return (
                              <option key={ticket.id} value={ticket.id} className="bg-zinc-950 text-white">
                                {ticket.name} — {priceLabel}
                              </option>
                            );
                          })}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-purple-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detalle visual de la entrada seleccionada */}
                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Zona</span>
                      <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate">
                        {selectedTicket?.name || "Entrada General"}
                      </h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Inversión</span>
                      {Number(selectedTicket?.price) === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-black text-xs whitespace-nowrap shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                          S/ 0 · Pase Libre
                        </span>
                      ) : (
                        <span className="text-xl sm:text-2xl font-[1000] font-mono text-purple-400 whitespace-nowrap">
                          S/ {Number(selectedTicket?.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Beneficios / Features */}
                  {selectedTicket && selectedTicket.features && selectedTicket.features.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2">
                      {selectedTicket.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                          <span className="text-pink-400 font-black text-xs leading-none mt-0.5">✦</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SELECTOR DE CANTIDAD (+ / -) */}
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 ml-1">
                    ¿Cuántos pases?
                  </label>
                  <div className="flex items-center justify-between bg-zinc-950/90 border border-zinc-800 rounded-2xl p-2.5">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 active:scale-95 text-white font-black text-xl flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed select-none"
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>
                    <div className="text-center font-black">
                      <span className="text-2xl sm:text-3xl text-white font-mono tracking-tight">{quantity}</span>
                      <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">
                        {quantity === 1 ? "Entrada" : "Entradas"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 font-black text-xl flex items-center justify-center transition select-none"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* TOTAL ESTIMADO */}
                <div className="pt-5 border-t border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Estimado</p>
                    {Number(selectedTicket?.price) === 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-[1000] text-white font-mono">S/ 0</span>
                        <span className="text-[10px] sm:text-xs font-black uppercase text-purple-400 tracking-wider bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md whitespace-nowrap">
                          Pase Libre
                        </span>
                      </div>
                    ) : (
                      <p className="text-3xl sm:text-4xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 font-mono">
                        S/ {(Number(selectedTicket?.price || 0) * quantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Sin comisiones</span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Confirmación Directa
                    </span>
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
                  className="w-full py-4 sm:py-5 px-6 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 hover:from-white hover:to-white text-black font-[1000] uppercase text-xs sm:text-sm tracking-wider rounded-2xl sm:rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <span className="text-lg">🚀</span>
                  <span className="whitespace-nowrap">
                    {isReserving ? "Procesando..." : (Number(selectedTicket?.price) === 0 ? "Reservar Pase por WhatsApp" : "Comprar por WhatsApp")}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* VISOR LIGHTBOX EN PANTALLA COMPLETA */}
      {lightboxIndex !== null && event?.gallery_images && (
        <GalleryLightboxModal
          images={event.gallery_images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

export default EventDetails
