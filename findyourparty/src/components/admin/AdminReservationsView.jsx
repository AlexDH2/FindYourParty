import { useState } from "react"
import { formatReservationCode } from "../../utils/whatsapp"

export default function AdminReservationsView({ reservations = [], history = [], refetchHistory }) {
  const [view, setView] = useState("general")
  const [filterText, setFilterText] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [copiedId, setCopiedId] = useState(null)

  let filteredReservations = reservations.filter((r) => {
    const q = filterText.toLowerCase().trim()
    if (!q) return true
    const title = (r?.events?.title || "").toLowerCase()
    const id = (r?.id || "").toLowerCase()
    const code = formatReservationCode(r?.id).toLowerCase()
    const type = (r?.ticket_type || "").toLowerCase()
    const stage = (r?.ticket_stage || "").toLowerCase()
    return title.includes(q) || id.includes(q) || code.includes(q) || type.includes(q) || stage.includes(q)
  })

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
            placeholder="🔍 Filtrar por código, evento, zona o fase..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none w-52 sm:w-64"
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
            filteredReservations.map((res) => {
              const resCode = formatReservationCode(res?.id)
              const isCopied = copiedId === res?.id
              const isFree = Number(res?.unit_price) === 0
              const dateStr = res?.created_at ? new Date(res.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ""

              return (
                <div key={res?.id} className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-850 hover:border-purple-500/50 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-zinc-100 truncate">{res?.events?.title || "Evento Base"}</h4>
                      {dateStr && <span className="text-[10px] text-zinc-500 font-mono">({dateStr})</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(resCode)
                          setCopiedId(res?.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                        className="bg-zinc-950 border border-purple-500/30 hover:border-purple-400 text-purple-300 font-mono text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
                        title="Copiar código de reserva"
                      >
                        <span>{resCode}</span>
                        <span className="text-[9px] text-zinc-400">{isCopied ? "✓ Copiado" : "📋"}</span>
                      </button>
                      <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                        {res?.ticket_type || "Entrada"}
                      </span>
                      {res?.ticket_stage && (
                        <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-md">
                          ⚡ {res?.ticket_stage}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/50">
                    <span className="bg-zinc-950 border border-lime-500/30 text-lime-400 font-mono px-3 py-1 rounded-xl text-xs font-black">
                      x{res?.quantity || 0} {Number(res?.quantity) === 1 ? "ENTRADA" : "ENTRADAS"}
                    </span>
                    <span className="text-xs text-zinc-300 font-mono font-bold">
                      {isFree ? "Gratis (Pase Libre)" : `Total: S/ ${((Number(res?.quantity) || 0) * (Number(res?.unit_price) || 0)).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )
            })
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