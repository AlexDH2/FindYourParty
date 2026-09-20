import { useState } from "react"
import { storageService } from "../../services/storageService"
import { supabase } from "../../lib/supabase"
import { compressImage } from "../../utils/imageCompression"

export default function FlyerGalleryUploader({ galleryImages, setGalleryImages, setFormData }) {
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = files.map(async (file, index) => {
        // Detectar si es un mapa/croquis por nombre de archivo
        const isMap = /mapa|dist|croquis|plano/i.test(file.name)

        // Comprimir imagen antes de subir
        const compressedFile = await compressImage(file, { isMap })

        const ext = compressedFile.name.split(".").pop() || "webp"
        const fileName = `${Date.now()}-${index}-${file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "_")}.${ext}`
        await storageService.uploadImage({ bucket: "event-images", fileName, file: compressedFile })
        const publicUrl = storageService.getPublicUrl({ bucket: "event-images", fileName })

        let suggestedLabel = "Flyer"
        if (galleryImages.length === 0 && index === 0) suggestedLabel = "Portada"
        else if (file.name.toLowerCase().includes("mapa") || file.name.toLowerCase().includes("dist")) suggestedLabel = "Croquis Zonas"
        else if (file.name.toLowerCase().includes("estacionamiento")) suggestedLabel = "Estacionamiento"
        else if (file.name.toLowerCase().includes("mesa")) suggestedLabel = "Mesas"
        else if (file.name.toLowerCase().includes("preventa")) suggestedLabel = "Precios"

        return { url: publicUrl, label: suggestedLabel, storagePath: fileName }
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

  async function removeImage(idx) {
    const imageToRemove = galleryImages[idx]

    // Intentar eliminar del Storage si tiene storagePath
    if (imageToRemove?.storagePath) {
      try {
        await supabase.storage.from("event-images").remove([imageToRemove.storagePath])
      } catch (err) {
        console.warn("No se pudo eliminar imagen del storage:", err)
      }
    }

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
          <p className="text-[11px] text-zinc-500">Selecciona o arrastra todos tus flyers juntos (se comprimen a WebP automáticamente)</p>
        </div>
        {isUploading && <span className="text-xs text-pink-400 font-bold animate-pulse">Comprimiendo y subiendo...</span>}
      </div>

      <label className="border-2 border-dashed border-zinc-800 hover:border-pink-500/50 p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/60">
        <span className="text-2xl mb-1">📥</span>
        <span className="text-xs font-bold text-zinc-300">Arrastra o haz clic para subir varios flyers</span>
        <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
      </label>

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <img src={img.url} alt={img.label} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                <select
                  value={img.label}
                  onChange={(e) => updateLabel(idx, e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-white text-[10px] rounded px-2 py-1"
                >
                  <option>Portada</option>
                  <option>Flyer</option>
                  <option>Croquis Zonas</option>
                  <option>Estacionamiento</option>
                  <option>Mesas</option>
                  <option>Precios</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-red-400 text-[10px] font-bold hover:text-red-300"
                >
                  🗑️ Eliminar
                </button>
              </div>
              <span className="absolute bottom-1 left-1 bg-black/80 text-[9px] text-zinc-300 font-bold px-2 py-0.5 rounded-full">{img.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}