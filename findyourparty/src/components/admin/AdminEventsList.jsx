export default function AdminEventsList({ events, search, setSearch, onEdit, onDelete, onDuplicate, canDeleteEvents }) {
  const filtered = events.filter(e => e?.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="bg-zinc-950/70 p-6 rounded-[2.5rem] border border-zinc-850 space-y-4 shadow-xl">
      <div className="flex justify-between items-center gap-2">
        <div>
          <h3 className="text-lg font-[900] uppercase tracking-tight">📅 Carteleras</h3>
          <p className="text-[11px] text-zinc-500">Eventos en base de datos</p>
        </div>
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-36"
        />
      </div>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center py-6">No hay eventos cargados.</p>
        ) : (
          filtered.map((event) => (
            <div
              key={event.id}
              className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 flex justify-between items-center gap-3 hover:border-purple-500/40 transition-all flex-wrap sm:flex-nowrap"
            >
              <div className="flex items-center gap-3 min-w-0">
                {event.image ? (
                  <img src={event.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-zinc-800 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-xs font-black text-zinc-600">FYP</div>
                )}
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-zinc-100 truncate flex items-center gap-1">
                    {event.title}
                    {event.publication_status === 'published' && <span title="Publicado">🟢</span>}
                    {event.publication_status === 'draft' && <span title="Borrador">🟡</span>}
                    {event.publication_status === 'hidden' && <span title="Oculto">⚫</span>}
                  </h4>
                  <p className="text-[10px] text-zinc-400 truncate">📍 {event.location}</p>
                  <p className="text-[10px] text-purple-400 font-bold">📅 {event.date}</p>
                </div>
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                <a
                  href={`/evento/${event.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-center"
                  title="Vista Previa"
                >
                  👁️
                </a>
                <button
                  onClick={() => onDuplicate && onDuplicate(event)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => onEdit(event)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                >
                  Editar
                </button>
                {canDeleteEvents && (
                  <button
                    onClick={() => {
                      if (window.confirm("¿Seguro que deseas eliminar este evento?")) onDelete(event.id)
                    }}
                    className="bg-red-950/40 hover:bg-red-900/60 text-red-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}