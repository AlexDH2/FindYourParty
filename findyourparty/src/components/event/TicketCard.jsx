import React from 'react';

function TicketCard({ ticket, isSelected, onSelect }) {
  const handleClick = () => {
    onSelect(ticket);
  };

  return (
    <div
      className={`
        bg-zinc-950/50 p-6 rounded-3xl border
        ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-zinc-800 hover:border-zinc-700'}
        transition-all duration-300 cursor-pointer
      `}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-black uppercase tracking-tight text-white">
          {ticket.name}
        </h3>
        <span className="text-lime-400 font-black text-2xl font-mono">
          S/.{Number(ticket.price).toFixed(2)}
        </span>
      </div>
      <p className="text-zinc-400 text-sm font-medium mb-3">
        {ticket.description}
      </p>
      {ticket.features && ticket.features.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-xs text-zinc-300 font-medium">
          {ticket.features.map((feature, index) => (
            <li key={index} className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              {feature}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 text-right">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
          Etapa: {ticket.stageName}
        </span>
        {ticket.end_date && (
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">
            (Hasta: {ticket.end_date})
          </span>
        )}
      </div>
    </div>
  );
}

export default TicketCard;