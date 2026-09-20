import { motion } from 'framer-motion';

const EventHero = ({ event }) => {
  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
      {/* Dynamic Background */}
      <motion.img
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, repeat: 1, repeatType: "reverse" }}
        src={event.image || "/FYP_banner_default.png"}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
      />
      
      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/30 z-10" />
      
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap gap-3">
            <span className="bg-purple-600/20 border border-purple-500/40 text-purple-400 font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-full backdrop-blur-md">
              🎵 {event.category}
            </span>
            {event.featured && (
               <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-full backdrop-blur-md">
                🔥 TOP EVENT
              </span>
            )}
          </div>

          <h1 className="text-6xl md:text-9xl font-[1000] tracking-tighter uppercase leading-[0.8] bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-8 items-center text-zinc-400 font-bold uppercase tracking-widest text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-purple-500 text-lg">📍</span> {event.location}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-lg">📅</span> {event.date}
            </div>
            {event.organizer && (
              <div className="flex items-center gap-2">
                <span className="text-pink-500 text-lg">👤</span> {event.organizer}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Blur elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};

export default EventHero;
