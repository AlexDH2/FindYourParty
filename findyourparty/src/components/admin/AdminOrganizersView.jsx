import { useState, useEffect, useRef } from "react"
import { organizerService } from "../../services/organizerService"
import { storageService } from "../../services/storageService"

export default function AdminOrganizersView() {
  const [organizers, setOrganizers] = useState([])
  const [name, setName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  
  // Redes Principales
  const [instagram, setInstagram] = useState("")
  const [tiktok, setTiktok] = useState("")
  
  // Redes Sociales Dinámicas Adicionales
  const [extraNetworks, setExtraNetworks] = useState([])
  
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  const load = async () => {
    try {
      const list = await organizerService.listOrganizers()
      setOrganizers(list || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { void load() }, [])

  // Subir logo desde la computadora mediante storageService
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    try {
      const fileName = `logo-${Date.now()}-${file.name.replace(/\s+/g, "_")}`
      await storageService.uploadImage({
        bucket: "event-images",
        fileName,
        file
      })
      const publicUrl = storageService.getPublicUrl({
        bucket: "event-images",
        fileName
      })
      setLogoUrl(publicUrl)
    } catch (err) {
      console.error("Error al subir logo:", err)
      alert("No se pudo cargar la imagen desde tu equipo.")
    } finally {
      setIsUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleAddExtraNetwork = () => {
    setExtraNetworks(prev => [
      ...prev,
      { id: Date.now(), platform: "Facebook", value: "" }
    ])
  }

  const handleRemoveExtraNetwork = (id) => {
    setExtraNetworks(prev => prev.filter(item => item.id !== id))
  }

  const handleExtraNetworkChange = (id, field, val) => {
    setExtraNetworks(prev =>
      prev.map(item => item.id === id ? { ...item, [field]: val } : item)
    )
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)

    try {
      const socialMediaPayload = {}
      if (instagram.trim()) socialMediaPayload.instagram = instagram.trim()
      if (tiktok.trim()) socialMediaPayload.tiktok = tiktok.trim()

      extraNetworks.forEach(net => {
        if (net.value.trim()) {
          socialMediaPayload[net.platform.toLowerCase()] = net.value.trim()
        }
      })

      await organizerService.createOrganizer({
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        social_media: socialMediaPayload
      })

      setName("")
      setLogoUrl("")
      setInstagram("")
      setTiktok("")
      setExtraNetworks([])
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
          
          {/* Nombre */}
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

          {/* Subida de Logo Local */}
          <div>
            <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Logo / Imagen de Marca</label>
            
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {logoUrl ? (
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-3">
                  <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover bg-zinc-950 border border-zinc-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-lime-400 font-bold">✓ Archivo cargado al sistema</p>
                    <p className="text-[10px] text-zinc-500 truncate">{logoUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 bg-red-950/40 rounded-lg"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-800 hover:border-pink-500/50 p-4 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white bg-zinc-900/60 transition-colors cursor-pointer"
                >
                  <span className="text-lg">📁</span>
                  <span className="text-xs font-bold">
                    {isUploadingLogo ? "Subiendo desde tu equipo..." : "Subir Logo desde tu computadora"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-850 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-pink-400 uppercase tracking-wider">🌐 Redes Sociales</label>
            </div>

            {/* Instagram */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">📸</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Instagram</span>
              </div>
              <input
                type="text"
                placeholder="@euphoria_club"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>

            {/* TikTok */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">🎵</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">TikTok</span>
              </div>
              <input
                type="text"
                placeholder="@euphoria.tiktok"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            {/* Redes Adicionales */}
            {extraNetworks.map((net) => (
              <div key={net.id} className="flex gap-2 items-center pt-1 animate-in fade-in">
                <select
                  value={net.platform}
                  onChange={(e) => handleExtraNetworkChange(net.id, "platform", e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-300 outline-none w-28"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="X">X (Twitter)</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Spotify">Spotify</option>
                  <option value="Web">Página Web</option>
                </select>
                <input
                  type="text"
                  placeholder="Usuario o enlace"
                  value={net.value}
                  onChange={(e) => handleExtraNetworkChange(net.id, "value", e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExtraNetwork(net.id)}
                  className="text-zinc-500 hover:text-red-400 text-xs font-bold p-1"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddExtraNetwork}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 pt-1 cursor-pointer"
            >
              + Agregar otra red social
            </button>
          </div>

          <button
            type="submit"
            disabled={isSaving || isUploadingLogo}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase text-xs py-3.5 rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Guardando..." : "+ Guardar Organizador"}
          </button>
        </form>
      </div>

      {/* Lista de Organizadores (7 de 12) */}
      <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-850 p-6 md:p-8 rounded-[2.5rem] space-y-4">
        <h3 className="text-xl font-black uppercase tracking-tight text-white">
          Directorio de Marcas ({organizers.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
          {organizers.length === 0 ? (
            <p className="text-zinc-600 text-xs py-8 col-span-full text-center">No hay organizadores creados todavía.</p>
          ) : (
            organizers.map((org) => {
              const sm = org.social_media || {}
              return (
                <div key={org.id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-start gap-3">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-900/30 text-purple-400 font-black text-base flex items-center justify-center border border-purple-500/30 shrink-0 mt-0.5">
                      {org.name?.charAt(0) || "👑"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-extrabold text-sm text-zinc-100 truncate">{org.name}</h4>
                    
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sm.instagram && (
                        <span className="text-[10px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20 truncate">
                          IG: {sm.instagram}
                        </span>
                      )}
                      {sm.tiktok && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 truncate">
                          TT: {sm.tiktok}
                        </span>
                      )}
                      {Object.keys(sm).filter(k => k !== 'instagram' && k !== 'tiktok').map(netKey => (
                        <span key={netKey} className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md truncate">
                          {netKey.toUpperCase()}: {sm[netKey]}
                        </span>
                      ))}
                      {!sm.instagram && !sm.tiktok && Object.keys(sm).length === 0 && (
                        <span className="text-[10px] text-zinc-500">Sin redes asignadas</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

    </div>
  )
}