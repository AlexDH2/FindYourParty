import { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Simple mock countdown if date format is not parsable
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime() || (now + 100000000);
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.days < 0 || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0)) {
    return (
      <div className="flex justify-center py-10">
        <div className="text-center group">
          <span className="text-2xl md:text-3xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-mono">
            🎉 ¡El evento ya comenzó!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 md:gap-8 justify-center py-10">
      {[
        { label: 'Días', value: timeLeft.days },
        { label: 'Horas', value: timeLeft.hours },
        { label: 'Minutos', value: timeLeft.minutes },
        { label: 'Segundos', value: timeLeft.seconds }
      ].map((item) => (
        <div key={item.label} className="text-center group">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mb-2 shadow-2xl group-hover:border-purple-500/50 transition-colors">
            <span className="text-2xl md:text-4xl font-[1000] text-white font-mono">{String(item.value).padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
