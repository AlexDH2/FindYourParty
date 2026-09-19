import { useState } from "react"
import { storageService } from "../../services/storageService"

export default function FlyerGalleryUploader({ galleryImages, setGalleryImages, setFormData }) {
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${Date.now()}-${index}-${file.name.replace(/\s+/g, "_")}`
        await storageService.uploadImage({ bucket: "event-images", fileName, file })
        const publicUrl = storageService.getPublicUrl({ bucket: "event-images", fileName })

        let suggestedLabel = "Flyer"
        if (galleryImages.length === 0 && index === 0) suggestedLabel = "Portada"
        else if (file.name.toLowerCase().includes("mapa") || file.name.toLowerCase().includes("dist")) suggestedLabel = "Croquis Zonas"
        else if (file.name.toLowerCase().includes("estacionamiento")) suggestedLabel = "Estacionamiento"
        else if (file.name.toLowerCase().includes("mesa")) suggestedLabel = "Mesas"
        else if (file.name.toLowerCase().includes("preventa")) suggestedLabel = "Precios"

        return { url: publicUrl, label: suggestedLabel }
      })

      const uploaded = await Promise.all(uploadPromises)
      const updated = [...galleryImages, ...uploaded]
      setGalleryImages(updated)

      setFormData(prev => ({
        ...prev,
        image: prev.image || updated[0]?.url || "",
        gallery_images: updated,
        local_distribution_image: updated.find(img => img.label.includes("Croquis"))?.url || prev.local_distribution_image
      }))
    } catch (err) {
      console.error(err)
      alert("Error al subir flyers.")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  function removeImage(idx) {
    const updated = galleryImages.filter((_, i) => i !== idx)
    setGalleryImages(updated)
    setFormData(prev => ({ ...prev, image: updated[0]?.url || "", gallery_images: updated }))
  }

  function updateLabel(idx, newLabel) {
    const updated = galleryImages.map((img, i) => (i === idx ? { ...img, label: newLabel } : img))
    setGalleryImages(updated)
    if (newLabel === "Portada") setFormData(prev => ({ ...prev, image: updated[idx].url }))
    if (newLabel.includes("Croquis")) setFormData(prev => ({ ...prev, local_distribution_image: updated[idx].url }))
  }

  return (
    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black uppercase text-pink-400">📸 Galería de Flyers</h3>
          <p className="text-[11px] text-zinc-500">Selecciona o arrastra todos tus flyers juntos</p>
        </div>
        {isUploading && <span className="text-xs text-pink-400 font-bold animate-pulse">Subiendo...</span>}
      </div>

      <label className="border-2 border-dashed border-zinc-800 hover:border-pink-500/50 p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/60">
        <span className="text-2xl mb-1">📥</span>
        <span className="text-xs font-bold text-zinc-300">Arrastra o haz clic para subir varios flyers</span>
        <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
      </label>

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="relative bg-zinc-950 rounded-xl border border-zinc-800 p-2">
              <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
              <select
                value={img.label}
                onChange={(e) => updateLabel(idx, e.target.value)}
                className="w-full bg-zinc-900 text-[10px] font-bold p-1 rounded border border-zinc-700 text-zinc-200 outline-none"
              >
                <option value="Portada">⭐ Portada</option>
                <option value="Precios">🎟️ Precios / Preventa</option>
                <option value="Mesas">🍾 Mesas / Boxes</option>
                <option value="Croquis Zonas">🗺️ Croquis Zonas</option>
                <option value="Ubicación">📍 Cómo Llegar</option>
                <option value="Promo 4x3">🔥 Promo 4x3</option>
                <option value="Estacionamiento">🚗 Estacionamiento</option>
                <option value="Flyer">Otro</option>
              </select>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}