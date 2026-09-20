import React, { useState, useEffect } from 'react';

export default function PromoBanner({ imageUrl, expiresAt, onClick }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('EXPIRADO');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (isExpired || !imageUrl) return null;

  return (
    <div 
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer group mb-8 shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-transform hover:scale-[1.02] border border-pink-500/50"
    >
      <img 
        src={imageUrl} 
        alt="Promoción Especial" 
        className="w-full h-auto object-cover"
      />
      
      {/* Etiqueta flotante con el cronómetro */}
      {timeLeft && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-pink-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
          <span className="text-xs font-black tracking-widest text-pink-300 uppercase">Termina en:</span>
          <span className="text-sm font-bold tabular-nums">{timeLeft}</span>
        </div>
      )}

      {/* Capa interactiva de "Click para comprar" */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
        <span className="bg-pink-600 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-xl flex items-center gap-2">
          Comprar Ahora
          <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </span>
      </div>
    </div>
  );
}
