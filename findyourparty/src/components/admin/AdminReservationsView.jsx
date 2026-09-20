import { useState } from "react"

export default function AdminReservationsView({ reservations = [], history = [], refetchHistory }) {
  const [view, setView] = useState("general")
  const [filterText, setFilterText] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  let filteredReservations = reservations.filter((r) =>
    (r?.events?.title || "").toLowerCase().includes(filterText.toLowerCase())
  )

  if (startDate) {
    filteredReservations = filteredReservations.filter(r => !r.created_at || new Date(r.created_at) >= new Date(startDate))
  }
  if (endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    filteredReservations = filteredReservations.filter(r => !r.created_at || new Date(r.created_at) <= end)
  }

  function handleExportCSV() {
    const dataToExport = view === "general" ? filteredReservations : history
    if (dataToExport.length === 0) return alert("No hay datos para exportar")

    const headers = ["ID", "Evento", "Tipo", "Fase", "Cantidad", "Precio Unitario", "Total", "Fecha"]
    const rows = dataToExport.map(r => {
      if (view === "general") {
        const qty = Number(r.quantity) || 0
        const price = Number(r.unit_price) || 0
        return [
          r.id,
          `"${r.events?.title || ""}"`,
          `"${r.ticket_type || ""}"`,
          `"${r.ticket_stage || ""}"`,
          qty,
          price,
          qty * price,
          r.created_at || ""
        ]
      } else {
        const qty = Number(r.quantity) || 0
        return [
          r.id,
          `"${r.event_title || ""}"`,
          `"${r.ticket_type || ""}"`,
          `""`,
          qty,
          0,
          0,
          r.created_at || ""
        ]
      }
    })

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `reservas_${view}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-zinc-950/80 border border-zinc-850 p-6 md:p-8 rounded-[2.5rem] space-y-6 shadow-xl animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-xl font-[1000] uppercase tracking-tight text-white flex items-center gap-2">
            📱 Centro de Reservas WhatsApp
          </h3>
          <p className="text-xs text-zinc-500">Monitorea y audita cada solicitud de entrada generada</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none [color-scheme:dark]"
            title="Fecha inicio"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none [color-scheme:dark]"
            title="Fecha fin"
          />
          <input
            type="text"
            placeholder="🔍 Filtrar por evento..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none w-40"
          />
          <button
            onClick={handleExportCSV}
            className="bg-lime-900/40 hover:bg-lime-900/60 border border-lime-500/30 text-lime-400 font-bold uppercase text-xs px-3 py-2 rounded-xl transition-all"
          >
            Exportar CSV
          </button>
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
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">
                    ID DE RESERVA: #{String(res?.id).substring(0, 10)} • {res?.ticket_type || "Entrada"} {res?.ticket_stage ? `(${res?.ticket_stage})` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="bg-zinc-950 border border-purple-500/30 text-lime-400 font-mono px-3 py-1.5 rounded-xl text-xs font-black block text-center mb-1">
                      x{res?.quantity || 0} ENTRADAS
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold block text-center">
                      Total: S/. {(Number(res?.quantity) || 0) * (Number(res?.unit_price) || 0)}
                    </span>
                  </div>
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