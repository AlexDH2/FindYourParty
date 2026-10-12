import { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      let target;

      if (typeof targetDate === 'string' && targetDate.length === 10) {
        // Formato YYYY-MM-DD -> interpretar a las 21:00 en hora local
        const [y, m, d] = targetDate.split('-').map(Number);
        target = new Date(y, m - 1, d, 21, 0, 0).getTime();
      } else {
        target = new Date(targetDate).getTime();
      }

      if (!target || isNaN(target)) {
        target = now + 86400000 * 3;
      }

      const distance = target - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        isFinished: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isFinished) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black border border-purple-500/30 p-8 shadow-2xl text-center backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white text-2xl mb-3 shadow-lg shadow-pink-500/25">
          🎉
        </div>
        <h4 className="text-xl font-[1000] uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-white">
          ¡El evento ya comenzó!
        </h4>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Las puertas están abiertas. ¡Asegura tus entradas y nos vemos en la fiesta!
        </p>
      </div>
    );
  }

  const items = [
    { label: 'Días', value: timeLeft.days, isSeconds: false },
    { label: 'Horas', value: timeLeft.hours, isSeconds: false },
    { label: 'Minutos', value: timeLeft.minutes, isSeconds: false },
    { label: 'Segundos', value: timeLeft.seconds, isSeconds: true },
  ];

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-black/95 border border-zinc-850/80 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-pink-500/30 group">
      {/* Luces de ambiente difusas */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/20 transition-all duration-700" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700" />
      
      {/* Borde de brillo superior */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Header del Countdown */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/60 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
          </span>
          <span className="text-[11px] font-[1000] uppercase tracking-[0.25em] text-zinc-200">
            Iniciamos en
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-wider">
          <span className="text-pink-400">⚡</span>
          <span>Conteo Oficial</span>
        </div>
      </div>

      {/* Grid de 4 bloques */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-3.5 relative z-10">
        {items.map((item) => (
          <div
            key={item.label}
            className="relative flex flex-col items-center justify-center py-3.5 sm:py-4 px-1 sm:px-2 rounded-2xl md:rounded-3xl bg-zinc-900/60 border border-white/5 hover:border-pink-500/40 shadow-inner backdrop-blur-md transition-all duration-300 group/box hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/10"
          >
            {/* Brillo superior en la caja */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />

            {/* Línea horizontal central sutil estilo cronómetro digital */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/40 pointer-events-none" />

            {/* Número */}
            <span
              className={`text-2xl sm:text-3xl md:text-4xl font-[1000] font-mono tracking-tight leading-none mb-2 ${
                item.isSeconds
                  ? "text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-rose-300 to-purple-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                  : "text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.18)]"
              }`}
            >
              {String(item.value).padStart(2, '0')}
            </span>

            {/* Etiqueta */}
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 group-hover/box:text-zinc-200 transition-colors">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer sutil */}
      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-center gap-2 text-zinc-400 text-[10px] font-semibold relative z-10 text-center">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="tracking-wide">Reserva antes de que se agoten las entradas</span>
      </div>
    </div>
  );
};

export default Countdown;
