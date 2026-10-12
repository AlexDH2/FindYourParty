import { useState, useEffect } from "react"
import { organizerService } from "../../services/organizerService"
import { storageService } from "../../services/storageService"
import { compressImage } from "../../utils/imageCompression"
import { extractSocialHandle, buildSocialUrl } from "../../utils/socialUtils"

export default function AdminOrganizersView() {
  const [organizers, setOrganizers] = useState([])
  const [name, setName] = useState("")
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [instagramInput, setInstagramInput] = useState("")
  const [tiktokInput, setTiktokInput] = useState("")
  const [websiteInput, setWebsiteInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const igHandle = extractSocialHandle(instagramInput, "instagram")
  const ttHandle = extractSocialHandle(tiktokInput, "tiktok")

  const load = async () => {
    try {
      const list = await organizerService.listOrganizers()
      setOrganizers(list || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { void load() }, [])

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    if (logoPreview && logoPreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(logoPreview); } catch (_) {}
    }
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(logoPreview); } catch (_) {}
    }
    setLogoFile(null)
    setLogoPreview("")
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)

    try {
      let finalLogoUrl = null

      // Subir logo desde el ordenador si se seleccionó uno
      if (logoFile) {
        const compressed = await compressImage(logoFile, { isMap: false })
        const ext = compressed.name.split(".").pop() || "webp"
        const fileName = `org-logo-${Date.now()}.${ext}`
        await storageService.uploadImage({ bucket: "event-images", fileName, file: compressed })
        finalLogoUrl = storageService.getPublicUrl({ bucket: "event-images", fileName })
      }

      const socialMedia = {}
      if (igHandle) {
        socialMedia.instagram = igHandle
        socialMedia.instagram_url = buildSocialUrl(instagramInput, "instagram")
      }
      if (ttHandle) {
        socialMedia.tiktok = ttHandle
        socialMedia.tiktok_url = buildSocialUrl(tiktokInput, "tiktok")
      }
      if (websiteInput.trim()) {
        socialMedia.website = websiteInput.trim()
      }

      await organizerService.createOrganizer({
        name: name.trim(),
        logo_url: finalLogoUrl,
        social_media: socialMedia
      })

      setName("")
      handleRemoveLogo()
      setInstagramInput("")
      setTiktokInput("")
      setWebsiteInput("")
      await load()
      alert("¡Organizador registrado con éxito!")
    } catch (err) {
      console.error(err)
      alert("Error al registrar organizador: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id, orgName) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el organizador "${orgName}"?`)) return
    try {
      await organizerService.deleteOrganizer(id)
      await load()
    } catch (err) {
      alert("Error al eliminar organizador: " + err.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* Formulario de registro (5 de 12) */}
      <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-850 p-6 md:p-8 rounded-[2.5rem] space-y-5">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            👑 Nuevo Organizador
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Registra las productoras o colectivos que firman las fiestas</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          
          {/* Nombre de la Productora */}
          <div>
            <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Nombre de la Productora</label>
            <input
              type="text"
              required
              placeholder="Ej: Euphoria Club, Rave Lima"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-pink-500 font-bold"
            />
          </div>

          {/* Subir Logo desde el Ordenador */}
          <div>
            <label className="text-[10px] font-black text-purple-400 uppercase block mb-1">Logo (Desde tu ordenador)</label>
            {logoPreview ? (
              <div className="flex items-center gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                <img src={logoPreview} alt="Logo" className="w-14 h-14 rounded-xl object-cover bg-black border border-zinc-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-bold truncate">{logoFile?.name || "Logo seleccionado"}</p>
                  <p className="text-[10px] text-zinc-500">Se comprimirá a WebP automáticamente</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-red-400 hover:text-red-300 text-xs font-bold p-2"
                  title="Quitar logo"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-zinc-800 hover:border-purple-500/50 p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-900/50">
                <span className="text-2xl mb-1">🖼️</span>
                <span className="text-xs font-bold text-zinc-300">Seleccionar logo del equipo</span>
                <span className="text-[10px] text-zinc-500">PNG, JPG o WebP</span>
                <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
              </label>
            )}
          </div>

          {/* Instagram con extracción automática de @ */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-pink-400 uppercase">Instagram (URL o @usuario)</label>
              {igHandle && (
                <span className="text-[10px] font-mono text-pink-300 font-bold bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">
                  Detectado: {igHandle}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="https://instagram.com/euphoria_club o @euphoria_club"
              value={instagramInput}
              onChange={(e) => setInstagramInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-pink-500"
            />
          </div>

          {/* TikTok con extracción automática de @ */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-cyan-400 uppercase">TikTok (Opcional - URL o @)</label>
              {ttHandle && (
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Detectado: {ttHandle}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="https://tiktok.com/@euphoria_club o @euphoria_club"
              value={tiktokInput}
              onChange={(e) => setTiktokInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500"
            />
          </div>

          {/* Web / Enlace adicional (Opcional) */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Sitio Web / Linktree (Opcional)</label>
            <input
              type="url"
              placeholder="https://linktr.ee/euphoriaclub"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-lime-400 text-black font-black uppercase text-xs py-3.5 rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "+ Guardar Organizador"}
          </button>
        </form>
      </div>

      {/* Lista de organizadores (7 de 12) */}
      <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-850 p-6 md:p-8 rounded-[2.5rem] space-y-4">
        <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center justify-between">
          <span>Directorio de Marcas ({organizers.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
          {organizers.length === 0 ? (
            <p className="text-zinc-600 text-xs py-12 col-span-full text-center font-bold">
              No hay organizadores creados todavía. Registra el primero a la izquierda.
            </p>
          ) : (
            organizers.map((org) => {
              const ig = org.social_media?.instagram
              const igUrl = org.social_media?.instagram_url || (ig ? `https://instagram.com/${ig.replace(/^@/, "")}` : null)
              const tt = org.social_media?.tiktok
              const ttUrl = org.social_media?.tiktok_url || (tt ? `https://tiktok.com/@${tt.replace(/^@/, "")}` : null)
              const web = org.social_media?.website

              return (
                <div key={org.id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between gap-3 group hover:border-purple-500/40 transition">
                  <div className="flex items-center gap-3">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-800 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-900/30 text-purple-400 font-black text-base flex items-center justify-center border border-purple-500/30 flex-shrink-0">
                        {org.name?.charAt(0) || "👑"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-zinc-100 truncate">{org.name}</h4>
                      <p className="text-[10px] text-zinc-500 truncate font-mono">/{org.slug || org.name.toLowerCase()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(org.id, org.name)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs p-1 transition"
                      title="Eliminar organizador"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Redes Sociales */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60">
                    {ig && (
                      <a
                        href={igUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                      >
                        <span>📷</span>
                        <span>{ig}</span>
                      </a>
                    )}
                    {tt && (
                      <a
                        href={ttUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                      >
                        <span>🎵</span>
                        <span>{tt}</span>
                      </a>
                    )}
                    {web && (
                      <a
                        href={web}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                      >
                        <span>🌐</span>
                        <span>Web</span>
                      </a>
                    )}
                    {!ig && !tt && !web && (
                      <span className="text-[10px] text-zinc-600 font-bold">Sin redes configuradas</span>
                    )}
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