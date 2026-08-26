import { motion } from 'framer-motion';

const Hero = ({ featuredEvent }) => {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center bg-zinc-950">
      {/* Background Image with Parallax effect (conceptual) */}
      <motion.img
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 1.5 }}
        src={featuredEvent?.image || "/FYP_banner_default.png"}
        alt={featuredEvent?.title || "Find Your Party"}
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
      />

      {/* Atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 w-full z-20 flex flex-col min-h-screen justify-center">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] md:text-xs uppercase font-black tracking-[0.3em] px-4 py-2 rounded-full w-fit backdrop-blur-md"
        >
          {featuredEvent ? "🔥 EVENTO DE LA SEMANA" : "✨ LIMA NIGHTLIFE"}
        </motion.span>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-6xl md:text-9xl font-black tracking-tighter mt-6 max-w-5xl leading-[0.85] uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent filter drop-shadow-2xl"
        >
          {featuredEvent?.title || "EVENTO DE LA SEMANA"}
        </motion.h1>

        {featuredEvent ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 max-w-xl space-y-4"
          >
            <p className="text-zinc-400 text-lg md:text-2xl font-medium tracking-wide flex items-center gap-3">
              <span className="text-purple-500">📍</span> {featuredEvent.location} 
              <span className="text-zinc-800">|</span> 
              <span className="text-cyan-400 font-bold tracking-tighter">📅 {featuredEvent.date}</span>
            </p>
            <p className="text-white font-black text-4xl md:text-5xl tracking-tight">
              Desde <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">S/{featuredEvent.price}</span>
            </p>
          </motion.div>
        ) : (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-400 text-lg md:text-xl max-w-xl mt-8 font-medium italic"
          >
            Próximamente. Estamos preparando las mejores experiencias nocturnas de Lima. ¡Atento a la cartelera!
          </motion.p>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-wrap gap-5"
        >
          {featuredEvent ? (
            <>
              <button
                className="group relative bg-white text-black font-black px-10 py-5 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest"
              >
                <span className="relative z-10">Ver Entradas</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 text-white font-bold px-10 py-5 rounded-2xl hover:bg-zinc-800 transition-all uppercase text-xs tracking-widest">
                Más Info
              </button>
            </>
          ) : (
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-10 py-5 rounded-2xl hover:opacity-90 transition-all uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              Explorar Cartelera
            </button>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-purple-500 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
