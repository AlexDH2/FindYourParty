import { slugify } from "../../utils/slugify"
import { getActiveTicketStageAndPrice } from "../../utils/priceUtils"
import { parseYYYYMMDDToLocalDate } from "../../utils/dateUtils"
import {
  getTicketMatrixPreset,
  getTablesPreset,
  getPromo4x3Preset,
  getParkingPreset
} from "../../constants/eventPresets"
import PartyDatePicker from "./PartyDatePicker"

export default function TicketManager({
  ticketTypes,
  setTicketTypes,
  eventDate,
  testDate,
  setTestDate
}) {
  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { id: Date.now(), name: "", features: [], stages: [] }
    ])
  }

  const removeTicketType = (id) => {
    setTicketTypes(ticketTypes.filter((t) => t.id !== id))
  }

  const handleTypeName = (id, name) => {
    setTicketTypes(
      ticketTypes.map((t) => (t.id === id ? { ...t, name, slug: slugify(name) } : t))
    )
  }

  const handleFeatures = (id, str) => {
    const features = str.split(",").map((f) => f.trim()).filter(Boolean)
    setTicketTypes(ticketTypes.map((t) => (t.id === id ? { ...t, features } : t)))
  }

  const addStage = (ticketId) => {
    setTicketTypes(
      ticketTypes.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              stages: [
                ...t.stages,
                {
                  id: Date.now(),
                  name: `Preventa ${t.stages.length + 1}`,
                  price: "",
                  start_date: "",
                  end_date: ""
                }
              ]
            }
          : t
      )
    )
  }

  const removeStage = (ticketId, stageId) => {
    setTicketTypes(
      ticketTypes.map((t) =>
        t.id === ticketId
          ? { ...t, stages: t.stages.filter((s) => s.id !== stageId) }
          : t
      )
    )
  }

  const handleStageChange = (ticketId, stageId, field, value) => {
    setTicketTypes(
      ticketTypes.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              stages: t.stages.map((s) => (s.id === stageId ? { ...s, [field]: value } : s))
            }
          : t
      )
    )
  }

  const getStageBadge = (stage) => {
    const today = parseYYYYMMDDToLocalDate(testDate)
    const start = parseYYYYMMDDToLocalDate(stage.start_date)
    const end = parseYYYYMMDDToLocalDate(stage.end_date)

    if (!start || !end) return { label: "Sin fechas", bg: "bg-zinc-800 text-zinc-500" }
    end.setHours(23, 59, 59, 999)

    if (today >= start && today <= end) {
      return { label: "ACTIVA AHORA", bg: "bg-lime-500/20 text-lime-400 border-lime-500/30" }
    }
    if (today < start) {
      return { label: "FUTURA", bg: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    }
    return { label: "FINALIZADA", bg: "bg-red-500/20 text-red-400 border-red-500/30" }
  }

  return (
    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850 space-y-4">
      
      {/* Encabezado con Fecha de Prueba usando PartyDatePicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <h3 className="text-sm font-black uppercase text-purple-400">🎟️ Entradas, Preventas y Mesas</h3>
          <p className="text-[11px] text-zinc-500">Configura precios escalonados por fecha de inicio y fin</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-400 uppercase font-black">Probar Fecha:</span>
          <div className="w-36">
            <PartyDatePicker
              value={testDate}
              onChange={(val) => setTestDate(val)}
              placeholder="Fecha prueba"
            />
          </div>
        </div>
      </div>

      {/* Botones Presets de 1 Clic */}
      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
        <p className="text-[10px] font-black text-lime-400 uppercase tracking-wider">⚡ Presets de 1 Clic:</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTicketTypes(getTicketMatrixPreset(eventDate))}
            className="bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600/40 text-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            + Matriz Fiestas (General, VIP, SuperVIP)
          </button>
          <button
            type="button"
            onClick={() => setTicketTypes((prev) => [...prev, ...getTablesPreset(eventDate)])}
            className="bg-pink-900/40 hover:bg-pink-800/60 border border-pink-600/40 text-pink-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            + Mesas 8PX
          </button>
          <button
            type="button"
            onClick={() => setTicketTypes((prev) => [...prev, ...getPromo4x3Preset(eventDate)])}
            className="bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-600/40 text-cyan-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            + Promo 4x3
          </button>
          <button
            type="button"
            onClick={() => setTicketTypes((prev) => [...prev, getParkingPreset(eventDate)])}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            + Estacionamiento S/ 30
          </button>
        </div>
      </div>

      {/* Zonas y Fases */}
      <div className="space-y-5">
        {ticketTypes.map((ticket) => {
          const activeStage = getActiveTicketStageAndPrice(ticket, new Date(testDate))

          return (
            <div key={ticket.id} className="bg-zinc-950/90 p-4 md:p-5 rounded-2xl border border-zinc-800 space-y-4">
              
              {/* Nombre de la zona y botón eliminar */}
              <div className="flex justify-between items-center gap-2">
                <input
                  type="text"
                  value={ticket.name}
                  onChange={(e) => handleTypeName(ticket.id, e.target.value)}
                  placeholder="Nombre de la zona (ej. VIP)"
                  className="bg-transparent text-base font-black text-white outline-none border-b border-zinc-700 focus:border-purple-500 w-full"
                />
                <button
                  type="button"
                  onClick={() => removeTicketType(ticket.id)}
                  className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider"
                >
                  Eliminar Zona
                </button>
              </div>

              {/* Beneficios incluidos */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Beneficios / Inclusiones:</label>
                <input
                  type="text"
                  placeholder="Separar por coma (ej: Piscina, Barra privada, Show en vivo)"
                  value={ticket.features?.join(", ") ?? ""}
                  onChange={(e) => handleFeatures(ticket.id, e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-300 outline-none focus:border-zinc-700"
                />
              </div>

              {/* Preventas / Fases con Fechas usando PartyDatePicker */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-purple-400 uppercase block">Etapas de Preventa (Fechas y Precios):</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ticket.stages.map((stage) => {
                    const badge = getStageBadge(stage)

                    return (
                      <div
                        key={stage.id}
                        className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 space-y-2.5 relative"
                      >
                        {/* Fila superior: Nombre de fase, Precio y Eliminar */}
                        <div className="flex justify-between items-center gap-2">
                          <input
                            type="text"
                            value={stage.name}
                            onChange={(e) => handleStageChange(ticket.id, stage.id, "name", e.target.value)}
                            className="bg-transparent font-bold text-zinc-100 outline-none text-xs border-b border-zinc-700 w-28"
                            placeholder="Nombre etapa"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-lime-400 font-bold text-xs">S/.</span>
                            <input
                              type="number"
                              value={stage.price}
                              onChange={(e) => handleStageChange(ticket.id, stage.id, "price", e.target.value)}
                              className="bg-zinc-950 border border-zinc-700 text-lime-400 font-bold w-16 p-1 rounded-lg text-right text-xs outline-none"
                              placeholder="0"
                            />
                            <button
                              type="button"
                              onClick={() => removeStage(ticket.id, stage.id)}
                              className="text-zinc-500 hover:text-red-400 text-xs font-bold ml-1"
                              title="Eliminar etapa"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Rango de Fechas: Inicio y Fin con PartyDatePicker */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase block mb-0.5">Inicio:</span>
                            <PartyDatePicker
                              value={stage.start_date ?? ""}
                              onChange={(val) => handleStageChange(ticket.id, stage.id, "start_date", val)}
                              placeholder="Fecha inicio"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase block mb-0.5">Cierre:</span>
                            <PartyDatePicker
                              value={stage.end_date ?? ""}
                              onChange={(val) => handleStageChange(ticket.id, stage.id, "end_date", val)}
                              placeholder="Fecha fin"
                            />
                          </div>
                        </div>

                        {/* Estado según la fecha probada */}
                        <div className="flex justify-between items-center text-[9px] pt-1">
                          <span className="text-zinc-500">Estado:</span>
                          <span className={`px-2 py-0.5 rounded-full font-black border text-[9px] ${badge.bg}`}>
                            ● {badge.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => addStage(ticket.id)}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 py-1"
                >
                  + Agregar otra etapa de preventa
                </button>
              </div>

              {/* Resumen del precio activo */}
              {activeStage ? (
                <div className="bg-lime-500/10 border border-lime-500/20 p-2.5 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-medium">Etapa activa según fecha de prueba:</span>
                  <span className="text-lime-400 font-black">{activeStage.stageName} — S/.{activeStage.price}</span>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-xs text-red-400 font-bold">
                  ⚠️ No hay ninguna preventa activa para la fecha seleccionada.
                </div>
              )}

            </div>
          )
        })}

        <button
          type="button"
          onClick={addTicketType}
          className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 py-3 rounded-2xl text-xs font-bold uppercase transition-all"
        >
          + Agregar Zona Manualmente
        </button>
      </div>

    </div>
  )
}