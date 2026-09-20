import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

export default function AdminDashboardView({ events = [], reservations = [], onNavigateToTab }) {
  const [dbStatus, setDbStatus] = useState("Conectando...")
  const activeEventsCount = events.filter(e => e.publication_status === 'published').length
  const totalReservationsCount = reservations.reduce((acc, r) => acc + (Number(r?.quantity) || 0), 0)

  // Calcular ingresos reales: quantity * unit_price por cada reserva
  const estimatedRevenue = reservations.reduce((acc, r) => {
    const qty = Number(r?.quantity) || 0
    const price = Number(r?.unit_price) || 0
    return acc + (qty * price)
  }, 0)

  useEffect(() => {
    async function checkDb() {
      try {
        const { error } = await supabase.from('events').select('id').limit(1)
        if (error) throw error
        setDbStatus("100% ONLINE")
      } catch (err) {
        setDbStatus("OFFLINE")
      }
    }
    checkDb()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950/80 border border-zinc-850 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-black text-purple-400 uppercase tracking-widest">Eventos Activos</span>
          <p className="text-3xl font-[1000] text-white tracking-tight">{activeEventsCount}</p>
          <p className="text-[10px] text-zinc-500 font-medium">Carteleras en base de datos</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-850 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-black text-pink-400 uppercase tracking-widest">Tickets Pedidos</span>
          <p className="text-3xl font-[1000] text-white tracking-tight">{totalReservationsCount} <span className="text-sm font-mono text-zinc-500">TIX</span></p>
          <p className="text-[10px] text-zinc-500 font-medium">Flujo vía WhatsApp</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-850 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-black text-lime-400 uppercase tracking-widest">Recaudación Estimada</span>
          <p className="text-3xl font-[1000] text-lime-400 tracking-tight font-mono">S/. {estimatedRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-500 font-medium">Basado en quantity × unit_price</p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-850 p-6 rounded-3xl space-y-2">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Estado del Sistema</span>
          <p className="text-2xl font-[1000] text-emerald-400 tracking-tight flex items-center gap-2">
            {dbStatus === "100% ONLINE" ? "● " : (dbStatus === "OFFLINE" ? "🔴 " : "🟡 ")}{dbStatus}
          </p>
          <p className="text-[10px] text-zinc-500 font-medium">Conexión Supabase</p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-zinc-900/40 border border-zinc-850 p-8 rounded-[2.5rem] space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight text-zinc-200">⚡ Acciones Inmediatas</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => onNavigateToTab("eventos")}
            className="bg-gradient-to-r from-pink-500 via-purple-600 to-lime-400 text-black font-black uppercase text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-all"
          >
            + Publicar Nueva Fiesta
          </button>
          <button
            onClick={() => onNavigateToTab("reservas")}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-bold uppercase text-xs px-6 py-3.5 rounded-2xl transition-all"
          >
            📱 Monitorear WhatsApp
          </button>
          <button
            onClick={() => onNavigateToTab("organizadores")}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-bold uppercase text-xs px-6 py-3.5 rounded-2xl transition-all"
          >
            👑 Gestionar Organizadores
          </button>
        </div>
      </div>

    </div>
  )
}