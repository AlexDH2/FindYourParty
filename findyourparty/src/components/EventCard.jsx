import { Link } from "react-router-dom";
import { getMinActivePrice, parseNewPricesJsonString } from "../utils/priceUtils";

function EventCard({ event }) {
  // Calculate min active price for display
  const minActivePrice = getMinActivePrice(parseNewPricesJsonString(event.prices_json));

  return (
    <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-850/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-500/40 hover:bg-zinc-950 transition-all duration-300 shadow-sm group">
      {/* Main clickable area for event details */}
      <Link to={`/evento/${event.slug}`} className="flex gap-4 items-center w-full md:w-auto">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-14 h-14 rounded-xl object-cover border border-zinc-800 flex-shrink-0 shadow-md" />
        ) : (
          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center font-black text-zinc-700 text-xs">FYP</div>
        )}
        <div>
          <h3 className="font-extrabold text-zinc-100 text-base tracking-tight group-hover:text-pink-400 transition-colors">{event.title}</h3>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            📍 {event.location} <span className="text-zinc-600 px-1">•</span> <span className="text-lime-400 font-bold">S/.{Number(minActivePrice || 0).toFixed(2)}</span>
          </p>
          <p className="text-[10px] font-bold text-purple-400/80 uppercase tracking-wider mt-0.5">📅 {event.date}</p>
        </div>
      </Link>

      {/* Google Maps link - separate clickable area */}
      {event.maps && (
        <a
          href={event.maps}
          target="_blank"
          rel="noreferrer"
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 text-[11px] px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex-shrink-0"
        >
          Ver Mapa
        </a>
      )}
    </div>
  );
}

export default EventCard;