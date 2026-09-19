import { useState } from "react"

export default function AdminReservations({ reservations, history, refetchHistory }) {
  const [view, setView] = useState("general")

  return (
    <div className="bg-zinc-950/70 p-6 rounded-[2.5rem] border border-zinc-850 space-y-4 shadow-xl">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-[900] uppercase tracking-tight">📊 Reservas</h3>
          <p className="text-[11px] text-zinc-500">Tráfico de WhatsApp</p>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-xl text-[9px] font-black uppercase">
          <button
            onClick={() => setView("general")}
            className={`px-2.5 py-1 rounded-lg ${view === "general" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
          >
            General
          </button>
          <button
            onClick={() => { setView("history"); void refetchHistory(); }}
            className={`px-2.5 py-1 rounded-lg ${view === "history" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
          >
            Historial
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar text-xs">
        {view === "general" && (
          reservations.length === 0 ? (
            <p className="text-zinc-600 text-center py-6">Sin reservas recientes.</p>
          ) : (
            reservations.map((res) => (
              <div key={res?.id} className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-850 flex justify-between items-center">
                <div>
                  <p className="font-bold text-zinc-200">{res?.events?.title || "Evento"}</p>
                  <p className="text-[9px] text-zinc-500">REF: {String(res?.id).substring(0, 8)}</p>
                </div>
                <span className="text-lime-400 font-mono font-bold">x{res?.quantity || 0}</span>
              </div>
            ))
          )
        )}

        {view === "history" && (
          history.length === 0 ? (
            <p className="text-zinc-600 text-center py-6">Sin historial.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-850 flex justify-between items-center">
                <div>
                  <p className="font-bold text-zinc-200">{item.event_title}</p>
                  <p className="text-[9px] text-zinc-500">{item.ticket_type} • {item.status}</p>
                </div>
                <span className="text-zinc-400 font-mono">x{item.quantity}</span>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}