import { useState } from "react"
import { storageService } from "../../services/storageService"
import { supabase } from "../../lib/supabase"
import { compressImage } from "../../utils/imageCompression"
import BannerCropperModal from "./BannerCropperModal"

export default function FlyerGalleryUploader({ galleryImages, setGalleryImages, setFormData }) {
  const [croppingIndex, setCroppingIndex] = useState(null)

  const isAnyUploading = galleryImages.some(img => img.isUploading)

  async function handleUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 1. Crear entradas optimistas con URL local inmediata
    const newEntries = files.map((file, i) => {
      const previewUrl = URL.createObjectURL(file)
      const tempId = `temp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`
      
      let suggestedLabel = "Flyer"
      if (galleryImages.length === 0 && i === 0) suggestedLabel = "Portada"
      else if (/mapa|dist|croquis|plano/i.test(file.name)) suggestedLabel = "Croquis Zonas"
      else if (/estacionamiento/i.test(file.name)) suggestedLabel = "Estacionamiento"
      else if (/mesa/i.test(file.name)) suggestedLabel = "Mesas"
      else if (/preventa/i.test(file.name)) suggestedLabel = "Precios"

      return {
        id: tempId,
        url: previewUrl,
        label: suggestedLabel,
        file,
        isUploading: true,
        uploadStatus: "comprimiendo",
        position: "50% 50%",
        zoom: 1
      }
    })

    // Actualizar de inmediato la UI (0s de espera)
    const updatedWithPreviews = [...galleryImages, ...newEntries]
    setGalleryImages(updatedWithPreviews)
    setFormData(prev => ({
      ...prev,
      image: prev.image || updatedWithPreviews[0]?.url || "",
      gallery_images: updatedWithPreviews,
      local_distribution_image: updatedWithPreviews.find(img => img.label.includes("Croquis"))?.url || prev.local_distribution_image
    }))

    // Resetear input para permitir volver a seleccionar los mismos archivos
    e.target.value = ""

    // 2. Procesar la cola en segundo plano
    for (const entry of newEntries) {
      try {
        const isMap = /mapa|dist|croquis|plano/i.test(entry.file.name)
        const compressedFile = await compressImage(entry.file, { isMap })

        // Notificar paso a 'subiendo'
        setGalleryImages(prev =>
          prev.map(img => img.id === entry.id ? { ...img, uploadStatus: "subiendo" } : img)
        )

        const ext = compressedFile.name.split(".").pop() || "webp"
        const fileName = `${Date.now()}-${entry.id}-${entry.file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "_")}.${ext}`
        await storageService.uploadImage({ bucket: "event-images", fileName, file: compressedFile })
        const publicUrl = storageService.getPublicUrl({ bucket: "event-images", fileName })

        // 3. Sustituir URL local por la URL pública definitiva
        setGalleryImages(prev => {
          const next = prev.map(img => {
            if (img.id === entry.id) {
              try { URL.revokeObjectURL(entry.url); } catch (_) {}
              return {
                ...img,
                url: publicUrl,
                storagePath: fileName,
                isUploading: false,
                uploadStatus: "listo"
              }
            }
            return img
          })

          setFormData(fd => ({
            ...fd,
            image: fd.image === entry.url ? publicUrl : (fd.image || next[0]?.url || ""),
            gallery_images: next,
            local_distribution_image: next.find(img => img.label.includes("Croquis"))?.url || fd.local_distribution_image
          }))

          return next
        })
      } catch (err) {
        console.error("Error al procesar flyer:", err)
        setGalleryImages(prev =>
          prev.map(img => img.id === entry.id ? { ...img, isUploading: false, uploadStatus: "error" } : img)
        )
      }
    }
  }

  async function removeImage(idx) {
    const imageToRemove = galleryImages[idx]

    if (imageToRemove?.url?.startsWith("blob:")) {
      try { URL.revokeObjectURL(imageToRemove.url); } catch (_) {}
    }

    if (imageToRemove?.storagePath) {
      try {
        await supabase.storage.from("event-images").remove([imageToRemove.storagePath])
      } catch (err) {
        console.warn("No se pudo eliminar imagen del storage:", err)
      }
    }

    const updated = galleryImages.filter((_, i) => i !== idx)
    setGalleryImages(updated)
    setFormData(prev => ({
      ...prev,
      image: updated[0]?.url || "",
      gallery_images: updated,
      local_distribution_image: updated.find(img => img.label.includes("Croquis"))?.url || null
    }))
  }

  function updateLabel(idx, newLabel) {
    const updated = galleryImages.map((img, i) => {
      if (i === idx) return { ...img, label: newLabel }
      if (newLabel === "Portada" && img.label === "Portada") return { ...img, label: "Flyer" }
      return img
    })
    setGalleryImages(updated)
    const portadaImg = updated.find(img => img.label === "Portada") || updated[0]
    setFormData(prev => ({
      ...prev,
      image: portadaImg?.url || prev.image,
      banner_position: portadaImg?.position || prev.banner_position,
      banner_zoom: portadaImg?.zoom || prev.banner_zoom,
      local_distribution_image: updated.find(img => img.label.includes("Croquis"))?.url || prev.local_distribution_image
    }))
  }

  return (
    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black uppercase text-pink-400">📸 Galería de Flyers</h3>
          <p className="text-[11px] text-zinc-500">
            Previsualización instantánea. Se comprimen y suben en segundo plano automáticamente.
          </p>
        </div>
        {isAnyUploading && (
          <span className="text-xs text-pink-400 font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            Subiendo en segundo plano...
          </span>
        )}
      </div>

      <label className="border-2 border-dashed border-zinc-800 hover:border-pink-500/50 p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/60">
        <span className="text-2xl mb-1">📥</span>
        <span className="text-xs font-bold text-zinc-300">Arrastra o haz clic para subir varios flyers</span>
        <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
      </label>

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {galleryImages.map((img, idx) => {
            const isPortada = img.label === "Portada" || (!galleryImages.some(g => g.label === "Portada") && idx === 0)
            return (
              <div
                key={img.id || idx}
                className={`relative group rounded-2xl overflow-hidden aspect-[4/5] transition-all ${
                  isPortada
                    ? "border-2 border-pink-500/80 ring-2 ring-pink-500/30 shadow-[0_0_25px_rgba(236,72,153,0.25)] bg-zinc-950"
                    : "border border-zinc-800 bg-zinc-950"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  style={{
                    objectPosition: img.position || "50% 50%",
                    transform: `scale(${img.zoom || 1})`,
                    transformOrigin: img.position || "50% 50%"
                  }}
                  onError={(e) => { e.currentTarget.src = "/FYP_banner_default.png"; }}
                  className="w-full h-full object-cover transition-transform duration-200"
                />

                {/* Badge visual exclusivo para la Portada */}
                {isPortada && (
                  <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-white/20 pointer-events-none">
                    <span>⭐</span> PORTADA
                  </div>
                )}

                {/* Indicador de subida individual en segundo plano */}
                {img.isUploading && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 z-20 pointer-events-none">
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-pink-300 uppercase tracking-wider">
                      {img.uploadStatus === "comprimiendo" ? "Comprimiendo..." : "Subiendo..."}
                    </span>
                  </div>
                )}

                {/* Mensaje de error si falla */}
                {img.uploadStatus === "error" && (
                  <div className="absolute top-2 right-2 bg-red-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-20">
                    Error
                  </div>
                )}

                {/* Menú de acción al pasar el mouse */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 z-30 p-2">
                  <select
                    value={img.label}
                    onChange={(e) => updateLabel(idx, e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold rounded-lg px-2 py-1 outline-none w-full text-center"
                  >
                    <option>Portada</option>
                    <option>Flyer</option>
                    <option>Croquis Zonas</option>
                    <option>Estacionamiento</option>
                    <option>Mesas</option>
                    <option>Precios</option>
                  </select>

                  <div className="flex items-center gap-1.5 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => setCroppingIndex(idx)}
                      className={`flex-1 text-[10px] font-black py-1 px-1.5 rounded-lg transition ${
                        isPortada
                          ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border border-pink-400/50 shadow-md"
                          : "bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold"
                      }`}
                      title={isPortada ? "Ajustar encuadre de la portada web" : "Ajustar encuadre del flyer"}
                    >
                      {isPortada ? "✂️ Encuadre Portada" : "✂️ Encuadre"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 text-[10px] font-bold py-1 px-1.5 rounded-lg transition"
                      title="Eliminar foto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Badge inferior con la etiqueta */}
                <span className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-md text-[9px] text-zinc-300 font-bold px-2 py-0.5 rounded-full border border-white/10 z-10 pointer-events-none">
                  {img.label}
                  {img.zoom && img.zoom > 1 && <span className="ml-1 text-pink-400 font-mono">({img.zoom}x)</span>}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal interactivo de encuadre individual */}
      {croppingIndex !== null && galleryImages[croppingIndex] && (() => {
        const targetImg = galleryImages[croppingIndex]
        const isTargetPortada = targetImg.label === "Portada" || (!galleryImages.some(g => g.label === "Portada") && croppingIndex === 0)
        return (
          <BannerCropperModal
            imageUrl={targetImg.url}
            initialPosition={targetImg.position || (isTargetPortada ? "50% 20%" : "50% 50%")}
            initialZoom={targetImg.zoom || 1}
            isPortada={isTargetPortada}
            label={targetImg.label}
            onSave={({ position, zoom }) => {
              const updated = galleryImages.map((img, i) =>
                i === croppingIndex ? { ...img, position, zoom } : img
              )
              setGalleryImages(updated)
              
              if (isTargetPortada) {
                setFormData(prev => ({
                  ...prev,
                  gallery_images: updated,
                  image: targetImg.url,
                  banner_position: position,
                  banner_zoom: zoom
                }))
              } else {
                const currentPortada = updated.find(g => g.label === "Portada") || updated[0]
                setFormData(prev => ({
                  ...prev,
                  gallery_images: updated,
                  banner_position: currentPortada?.position || prev.banner_position,
                  banner_zoom: currentPortada?.zoom || prev.banner_zoom
                }))
              }
            }}
            onClose={() => setCroppingIndex(null)}
          />
        )
      })()}
    </div>
  )
}