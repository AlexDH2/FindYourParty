import { useState } from "react"

export default function AdminReservationsView({ reservations = [], history = [], refetchHistory }) {
  const [view, setView] = useState("general")
  const [filterText, setFilterText] = useState("")

  const filteredReservations = reservations.filter((r) =>
    (r?.events?.title || "").toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div className="bg-zinc-950/80 border border-zinc-850 p-6 md:p-8 rounded-[2.5rem] space-y-6 shadow-xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-xl font-[1000] uppercase tracking-tight text-white flex items-center gap-2">
            📱 Centro de Reservas WhatsApp
          </h3>
          <p className="text-xs text-zinc-500">Monitorea y audita cada solicitud de entrada generada</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="🔍 Filtrar por evento..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none w-48"
          />
          <div className="flex bg-zinc-900 p-1 rounded-xl text-xs font-bold uppercase">
            <button
              onClick={() => setView("general")}
              className={`px-3 py-1.5 rounded-lg transition-all ${view === "general" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
            >
              En Vivo
            </button>
            <button
              onClick={() => { setView("history"); void refetchHistory(); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${view === "history" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
            >
              Historial
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {view === "general" && (
          filteredReservations.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-12">No hay reservas entrantes registradas.</p>
          ) : (
            filteredReservations.map((res) => (
              <div key={res?.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850/80 flex justify-between items-center hover:border-purple-500/40 transition-all">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-zinc-100">{res?.events?.title || "Evento Base"}</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">ID DE RESERVA: #{String(res?.id).substring(0, 10)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-zinc-950 border border-purple-500/30 text-lime-400 font-mono px-3 py-1.5 rounded-xl text-xs font-black">
                    x{res?.quantity || 0} ENTRADAS
                  </span>
                </div>
              </div>
            ))
          )
        )}

        {view === "history" && (
          history.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-12">No hay registros históricos archivados.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-200">{item.event_title}</h4>
                  <p className="text-[10px] text-zinc-500">{item.ticket_type} • Estado: {item.status}</p>
                </div>
                <span className="text-zinc-400 font-mono text-xs font-bold">x{item.quantity} TIX</span>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}