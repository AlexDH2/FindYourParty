import { useState, useEffect } from "react"
import { organizerService } from "../../services/organizerService"

export default function AdminOrganizersView() {
  const [organizers, setOrganizers] = useState([])
  const [name, setName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [instagram, setInstagram] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const load = async () => {
    try {
      const list = await organizerService.listOrganizers()
      setOrganizers(list || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { void load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    try {
      await organizerService.createOrganizer({
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        social_media: { instagram: instagram.trim() }
      })
      setName("")
      setLogoUrl("")
      setInstagram("")
      await load()
      alert("¡Organizador registrado con éxito!")
    } catch (err) {
      alert("Error al registrar organizador: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* Formulario de registro (5 de 12) */}
      <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-850 p-6 md:p-8 rounded-[2.5rem] space-y-5">
        <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          👑 Nuevo Organizador
        </h3>
        <p className="text-xs text-zinc-400">Registra las productoras o colectivos que firman las fiestas</p>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Nombre de la Productora</label>
            <input
              type="text"
              required
              placeholder="Ej: Euphoria Club, Rave Lima"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Logo URL (Opcional)</label>
            <input
              type="url"
              placeholder="https://.../logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Instagram (@usuario)</label>
            <input
              type="text"
              placeholder="@euphoria_club"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase text-xs py-3.5 rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "+ Guardar Organizador"}
          </button>
        </form>
      </div>

      {/* Lista de organizadores (7 de 12) */}
      <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-850 p-6 md:p-8 rounded-[2.5rem] space-y-4">
        <h3 className="text-xl font-black uppercase tracking-tight text-white">
          Directorio de Marcas ({organizers.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
          {organizers.length === 0 ? (
            <p className="text-zinc-600 text-xs py-8 col-span-full text-center">No hay organizadores creados todavía.</p>
          ) : (
            organizers.map((org) => (
              <div key={org.id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
                {org.logo_url ? (
                  <img src={org.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-800" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-900/30 text-purple-400 font-black text-base flex items-center justify-center border border-purple-500/30">
                    {org.name?.charAt(0) || "👑"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm text-zinc-100 truncate">{org.name}</h4>
                  <p className="text-[11px] text-pink-400 font-mono truncate">{org.social_media?.instagram || "@organizador"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}