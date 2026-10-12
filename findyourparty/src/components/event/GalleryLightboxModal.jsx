import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function GalleryLightboxModal({ images = [], initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)

  const total = images.length
  const currentImage = images[index]
  const currentUrl = currentImage?.url || currentImage || ""
  const currentLabel = currentImage?.label || `Foto ${index + 1}`

  const handlePrev = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
  }, [total])

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
  }, [total])

  // Navegación con teclado (Escape, Flechas) y bloqueo de scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") handlePrev()
      else if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handlePrev, handleNext, onClose])

  if (!images || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-fadeIn">
      
      {/* Barra Superior */}
      <div className="flex justify-between items-center px-4 md:px-8 py-3.5 border-b border-white/10 z-30 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs uppercase font-black px-3.5 py-1 rounded-full">
            {currentLabel}
          </span>
          <span className="text-zinc-400 text-xs font-mono font-bold">
            {index + 1} / {total}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-white hover:text-white bg-zinc-800/90 hover:bg-zinc-700 border border-white/10 rounded-full w-10 h-10 flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Cerrar visor"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Imagen Principal en Pantalla Completa sin Recorte */}
      <div className="relative flex-1 flex items-center justify-center p-3 md:p-8 overflow-hidden min-h-0">
        
        {/* Flecha Izquierda Centrada con SVG */}
        {total > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/15 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl backdrop-blur-md cursor-pointer"
            aria-label="Foto anterior"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Imagen central */}
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={currentUrl}
            alt={currentLabel}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="max-h-[72vh] md:max-h-[78vh] max-w-[92vw] md:max-w-[85vw] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)]"
          />
        </AnimatePresence>

        {/* Flecha Derecha Centrada con SVG */}
        {total > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/15 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl backdrop-blur-md cursor-pointer"
            aria-label="Siguiente foto"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Tira inferior de miniaturas */}
      {total > 1 && (
        <div className="p-3 md:p-4 bg-black/80 border-t border-white/10 flex justify-center items-center gap-2 overflow-x-auto custom-scrollbar z-30 max-w-full">
          {images.map((img, i) => {
            const url = img?.url || img
            const isSelected = i === index
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`relative w-12 h-14 md:w-16 md:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                  isSelected ? "border-purple-500 scale-105 shadow-lg shadow-purple-500/30" : "border-zinc-800 opacity-50 hover:opacity-100 hover:scale-102"
                }`}
              >
                <img src={url} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            )
          })}
        </div>
      )}

    </div>
  )
}
