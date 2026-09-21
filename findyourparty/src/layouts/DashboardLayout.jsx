import { Outlet, useSearchParams, useNavigate } from "react-router-dom"
import { useAdminProfile } from "../hooks/useAdminProfile"

export default function DashboardLayout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentTab = searchParams.get("tab") || "eventos"
  const { isSuperadmin, canManageOrganizers, canManageTeam } = useAdminProfile()

  const allNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "eventos", label: "Carteleras", icon: "📋" },
    { id: "nuevo-evento", label: "Editor", icon: "📝" },
    { id: "reservas", label: "Reservas", icon: "🧾" },
    { id: "organizadores", label: "Organizadores", icon: "🏢", requiredPermission: canManageOrganizers },
    { id: "equipo", label: "Equipo", icon: "👥", requiredPermission: canManageTeam }
  ]

  const navItems = allNavItems.filter(item => item.requiredPermission !== false)

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId })
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col md:flex-row">
      
      {/* BARRA LATERAL IZQUIERDA */}
      <aside className="w-full md:w-64 bg-zinc-950/90 border-r border-zinc-850/80 p-6 flex flex-col justify-between flex-shrink-0 z-20">
        <div className="space-y-8">
          
          {/* Logo Brand */}
          <div className="cursor-pointer" onClick={() => navigate("/admin?tab=eventos")}>
            <h2 className="text-xl font-[1000] tracking-tighter uppercase bg-gradient-to-r from-pink-500 via-purple-500 to-lime-400 bg-clip-text text-transparent">
              FYP ADMIN
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-0.5">Control Center</p>
          </div>

          {/* Menú de Botones */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 via-purple-600 to-purple-700 text-white shadow-lg shadow-pink-500/20 scale-[1.02]"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Pie de la barra lateral */}
        <div className="pt-6 border-t border-zinc-900 mt-6">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-[11px] font-bold text-zinc-400 hover:text-lime-400 transition-colors p-2 rounded-xl hover:bg-zinc-900/50"
          >
            <span>Ver Web Pública</span>
            <span>↗</span>
          </a>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-w-0 bg-[#030303] overflow-y-auto">
        <header className="px-6 md:px-10 py-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-sm md:text-base font-black uppercase tracking-widest text-zinc-200">
              PANEL DE CONTROL <span className="text-purple-500">•</span>{" "}
              <span className="text-pink-400">{currentTab}</span>
            </h1>
          </div>
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 shadow-md shadow-pink-500/40 animate-pulse" />
        </header>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  )
}