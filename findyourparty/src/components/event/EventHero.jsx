import { motion } from 'framer-motion';

const EventHero = ({ event }) => {
  const zoom = Number(event?.banner_zoom) || 1;
  const position = event?.banner_position || "50% 20%";

  return (
    <section className="relative h-[65vh] md:h-[82vh] w-full overflow-hidden">
      {/* Dynamic Background con encuadre fiel 1:1 */}
      <img
        src={event?.image || "/FYP_banner_default.png"}
        alt={event?.title}
        style={{
          objectPosition: position,
          transform: `scale(${zoom})`,
          transformOrigin: position,
        }}
        className="absolute inset-0 w-full h-full object-cover brightness-[0.55] transition-all duration-300 pointer-events-none select-none"
      />
      
      {/* Degradado oscuro inferior para legibilidad perfecta */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-black/40 to-black/20 z-10 pointer-events-none" />
      
      {/* Contenedor de contenido con padding inferior ampliado para no ser tapado por -mt-32 */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-36 md:pb-44">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 md:space-y-5"
        >
          <div className="flex flex-wrap gap-2.5">
            {event?.category && (
              <span className="bg-purple-600/30 border border-purple-500/50 text-purple-300 font-black uppercase text-[10px] tracking-widest px-3.5 py-1.5 rounded-full backdrop-blur-md">
                🎵 {event.category}
              </span>
            )}
            {event?.featured && (
              <span className="bg-amber-500/25 border border-amber-500/50 text-amber-300 font-black uppercase text-[10px] tracking-widest px-3.5 py-1.5 rounded-full backdrop-blur-md">
                🔥 TOP EVENT
              </span>
            )}
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-9xl font-[1000] tracking-tighter uppercase leading-[0.85] bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-md">
            {event?.title}
          </h1>

          <div className="flex flex-wrap gap-5 md:gap-8 items-center text-zinc-300 font-bold uppercase tracking-widest text-xs md:text-sm">
            {event?.location && (
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-base">📍</span> {event.location}
              </div>
            )}
            {event?.date && (
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-base">📅</span> {event.date}
              </div>
            )}
            {event?.organizer && (
              <div className="flex items-center gap-2">
                <span className="text-pink-400 text-base">👤</span> {event.organizer}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Blur elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};

export default EventHero;
