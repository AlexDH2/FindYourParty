import { useState } from 'react';
import { CATEGORIES, THEME } from '../../constants';

const SearchFilters = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleFilterClick = (cat) => {
    setActiveFilter(cat);
    onFilterChange(cat);
  };

  return (
    <section className="relative z-30 -mt-12 max-w-5xl mx-auto px-6">
      <div className={`p-2 rounded-[2.5rem] ${THEME.glass} shadow-2xl transition-all duration-500 ${isSearchFocused ? 'ring-2 ring-purple-500/50 scale-[1.02]' : ''}`}>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Buscar por artista, evento o club..." 
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-zinc-950/50 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-bold focus:ring-0 placeholder:text-zinc-600 transition-all"
            />
          </div>

          {/* Categories Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 md:py-0 px-2">
            {["Todos", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterClick(cat)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeFilter === cat 
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* City Filter Placeholder */}
          <div className="hidden lg:flex items-center px-6 border-l border-zinc-800/50 gap-3 cursor-pointer group">
            <span className="text-purple-500 group-hover:scale-110 transition-transform">📍</span>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Lima</span>
          </div>
        </div>
      </div>

      {/* Quick Stats/Tags */}
      <div className="mt-4 flex justify-center gap-6 overflow-x-auto no-scrollbar px-4">
        {[
          { label: 'Hoy', icon: '🔥' },
          { label: 'Este Finde', icon: '✨' },
          { label: 'Preventas', icon: '💎' },
          { label: 'Afters', icon: '🌙' }
        ].map((tag) => (
          <button key={tag.label} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-purple-400 transition-colors whitespace-nowrap">
            <span>{tag.icon}</span>
            {tag.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default SearchFilters;
