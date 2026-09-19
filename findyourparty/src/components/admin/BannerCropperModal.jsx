import { useState, useRef } from "react"

export default function BannerCropperModal({ imageUrl, initialPosition = "50% 20%", initialZoom = 1, onSave, onClose }) {
  // Parsear posición inicial (ej: "50% 20%")
  const parsePos = (posStr) => {
    if (!posStr) return { x: 50, y: 20 }
    const parts = posStr.split(" ")
    const x = parseFloat(parts[0]) || 50
    const y = parseFloat(parts) || 20
    return { x, y }
  }

  const [pos, setPos] = useState(parsePos(initialPosition))
  const [zoom, setZoom] = useState(initialZoom || 1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: pos.x, posY: pos.y })

  // Manejadores de arrastre con el mouse
  const handleMouseDown = (e) => {
    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const deltaX = (e.clientX - dragStartRef.current.mouseX) * 0.2
    const deltaY = (e.clientY - dragStartRef.current.mouseY) * 0.2

    // Invertimos para que al arrastrar hacia abajo la imagen baje, como en WhatsApp
    const newX = Math.min(100, Math.max(0, dragStartRef.current.posX - deltaX))
    const newY = Math.min(100, Math.max(0, dragStartRef.current.posY - deltaY))
    setPos({ x: Math.round(newX), y: Math.round(newY) })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Manejadores táctiles para celulares
  const handleTouchStart = (e) => {
    if (!e.touches[0]) return
    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.touches[0].clientX,
      mouseY: e.touches[0].clientY,
      posX: pos.x,
      posY: pos.y
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches[0]) return
    const deltaX = (e.touches[0].clientX - dragStartRef.current.mouseX) * 0.25
    const deltaY = (e.touches[0].clientY - dragStartRef.current.mouseY) * 0.25

    const newX = Math.min(100, Math.max(0, dragStartRef.current.posX - deltaX))
    const newY = Math.min(100, Math.max(0, dragStartRef.current.posY - deltaY))
    setPos({ x: Math.round(newX), y: Math.round(newY) })
  }

  const handleSave = () => {
    onSave({
      position: `${pos.x}% ${pos.y}%`,
      zoom: Number(zoom)
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#09090d] border border-purple-500/40 w-full max-w-2xl rounded-[2.5rem] p-6 space-y-5 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
          <div>
            <h3 className="text-lg font-[1000] uppercase tracking-tight text-white flex items-center gap-2">
              ✂️ Encuadre de Portada <span className="text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full font-black">ESTILO WHATSAPP</span>
            </h3>
            <p className="text-xs text-zinc-400">Arrastra la imagen con el ratón para colocar el título o personaje donde prefieras</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl font-bold p-1">✕</button>
        </div>

        {/* Marco de recorte interactivo */}
        <div className="relative w-full aspect-[16/8] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-inner select-none cursor-grab active:cursor-grabbing">
          
          <img
            src={imageUrl}
            alt="Ajuste"
            draggable={false}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{
              objectPosition: `${pos.x}% ${pos.y}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${pos.x}% ${pos.y}%`
            }}
            className="w-full h-full object-cover pointer-events-auto transition-transform duration-75"
          />

          {/* Cuadrícula de tercios guía (tipo cámara/WhatsApp) */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-r border-b border-white/10" />
            <div className="border-b border-white/10" />
            <div className="border-r border-white/10" />
            <div className="border-r border-white/10" />
            <div />
          </div>

          {/* Badge informativo sobre la imagen */}
          <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-zinc-300 pointer-events-none border border-white/10">
            Posición: X: {pos.x}% | Y: {pos.y}%
          </div>
        </div>

        {/* Barra de Control de Zoom */}
        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex items-center gap-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">🔍 Zoom:</span>
          <input
            type="range"
            min="1"
            max="2.5"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-pink-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-lime-400 w-12 text-right">
            {zoom.toFixed(2)}x
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white py-3 rounded-xl text-xs font-bold uppercase transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-pink-500 via-purple-600 to-lime-400 text-black font-[1000] py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all"
          >
            ✓ Aplicar Encuadre
          </button>
        </div>

      </div>
    </div>
  )
}