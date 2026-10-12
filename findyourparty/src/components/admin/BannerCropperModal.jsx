import { useState, useRef, useEffect } from "react"

export default function BannerCropperModal({
  imageUrl,
  initialPosition = "50% 20%",
  initialZoom = 1,
  isPortada = false,
  label = "Flyer",
  onSave,
  onClose
}) {
  // Parsear posición inicial (ej: "50% 20%")
  const parsePos = (posStr) => {
    if (!posStr) return { x: 50, y: isPortada ? 20 : 50 }
    const parts = String(posStr).trim().split(/\s+/)
    const x = parseFloat(parts[0])
    const y = parseFloat(parts[1])
    return {
      x: !isNaN(x) ? Math.min(100, Math.max(0, Math.round(x))) : 50,
      y: !isNaN(y) ? Math.min(100, Math.max(0, Math.round(y))) : (isPortada ? 20 : 50)
    }
  }

  const [pos, setPos] = useState(parsePos(initialPosition))
  const [zoom, setZoom] = useState(Number(initialZoom) || 1)
  const [isDragging, setIsDragging] = useState(false)
  const [showSimulatedOverlay, setShowSimulatedOverlay] = useState(isPortada)

  const containerRef = useRef(null)
  const dragStartRef = useRef({ clientX: 0, clientY: 0, posX: pos.x, posY: pos.y })

  // Manejo de puntero profesional (Pointer Events API con Pointer Capture)
  // Garantiza que el arrastre no se corte nunca aunque el cursor salga del cuadro
  const handlePointerDown = (e) => {
    if (!containerRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      posX: pos.x,
      posY: pos.y
    }
  }

  const handlePointerMove = (e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const dx = e.clientX - dragStartRef.current.clientX
    const dy = e.clientY - dragStartRef.current.clientY

    // Desplazamiento proporcional al tamaño del contenedor
    const deltaXPercent = (dx / rect.width) * 100
    const deltaYPercent = (dy / rect.height) * 100

    // Arrastrar hacia abajo (dy > 0) revela la parte superior del flyer (Y disminuye hacia 0%)
    // Arrastrar hacia arriba (dy < 0) revela la parte inferior del flyer (Y aumenta hacia 100%)
    const newX = Math.round(Math.min(100, Math.max(0, dragStartRef.current.posX - deltaXPercent)))
    const newY = Math.round(Math.min(100, Math.max(0, dragStartRef.current.posY - deltaYPercent)))

    setPos({ x: newX, y: newY })
  }

  const handlePointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (_) {}
    setIsDragging(false)
  }

  const handleSave = () => {
    onSave({
      position: `${pos.x}% ${pos.y}%`,
      zoom: Number(zoom)
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className={`bg-[#09090d] border ${isPortada ? "border-pink-500/50 shadow-[0_0_50px_rgba(236,72,153,0.3)]" : "border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.3)]"} w-full max-w-3xl rounded-[2.5rem] p-5 md:p-6 space-y-4 max-h-[95vh] overflow-y-auto`}>
        
        {/* Encabezado */}
        <div className="flex justify-between items-start border-b border-zinc-850 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-[1000] uppercase tracking-tight text-white flex flex-wrap items-center gap-2">
              ✂️ {isPortada ? "Encuadre de Portada Web" : `Encuadre de Flyer (${label})`}
              {isPortada ? (
                <span className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-600 text-white border border-pink-400/40 px-2.5 py-0.5 rounded-full font-black">
                  ⭐ BANNER PRINCIPAL WEB
                </span>
              ) : (
                <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-black">
                  VISTA VERTICAL
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              {isPortada
                ? "Arrastra con el ratón o usa los botones rápidos para fijar exactamente qué parte del flyer se verá en el banner."
                : "Ajusta el punto de enfoque vertical del flyer para la galería."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xl font-bold p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Marco de recorte interactivo */}
        <div className="space-y-2">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
            className={`relative w-full ${isPortada ? "aspect-[21/9]" : "aspect-[4/5] max-h-[50vh]"} mx-auto bg-zinc-950 rounded-2xl overflow-hidden border-2 ${isPortada ? "border-pink-500/60" : "border-purple-500/50"} shadow-inner select-none cursor-grab active:cursor-grabbing`}
          >
            <img
              src={imageUrl}
              alt="Ajuste"
              draggable={false}
              style={{
                objectPosition: `${pos.x}% ${pos.y}%`,
                transform: `scale(${zoom})`,
                transformOrigin: `${pos.x}% ${pos.y}%`
              }}
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Simulación visual de la vista pública (para verificar que no tape textos) */}
            {isPortada && showSimulatedOverlay && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4 bg-gradient-to-t from-black via-black/30 to-transparent">
                <div className="bg-black/40 backdrop-blur-[2px] p-2 rounded-xl border border-white/10 max-w-sm">
                  <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">🎵 EVENTO</span>
                  <span className="text-xl sm:text-2xl font-[1000] text-white tracking-tight uppercase block leading-none my-0.5">TÍTULO DEL EVENTO</span>
                  <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-wider">📍 UBICACIÓN • 📅 FECHA</span>
                </div>
              </div>
            )}

            {/* Cuadrícula de tercios guía */}
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

            {/* Badge de coordenadas en vivo */}
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-zinc-300 pointer-events-none border border-white/10">
              X: <span className="text-pink-400 font-bold">{pos.x}%</span> | Y: <span className="text-lime-400 font-bold">{pos.y}%</span>
            </div>
          </div>

          {/* Toggle de simulación de elementos */}
          {isPortada && (
            <div className="flex justify-between items-center px-1">
              <button
                type="button"
                onClick={() => setShowSimulatedOverlay(!showSimulatedOverlay)}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>{showSimulatedOverlay ? "👁️" : "🙈"}</span>
                {showSimulatedOverlay ? "Ocultar guía de título web" : "Mostrar guía de título web"}
              </button>
              <span className="text-[10px] text-zinc-500">
                Tip: Arrastra la imagen para moverla
              </span>
            </div>
          )}
        </div>

        {/* Botones de Posición Rápida (Atajos infalibles) */}
        <div className="space-y-1.5 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800">
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
            ⚡ Posiciones Rápidas (Eje Vertical)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPos(prev => ({ ...prev, y: 0 }))}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                pos.y === 0 ? "bg-pink-600 text-white shadow-md" : "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300"
              }`}
            >
              ⬆️ Arriba (0%)
            </button>
            <button
              type="button"
              onClick={() => setPos(prev => ({ ...prev, y: 50 }))}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                pos.y === 50 ? "bg-purple-600 text-white shadow-md" : "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300"
              }`}
            >
              🎯 Centro (50%)
            </button>
            <button
              type="button"
              onClick={() => setPos(prev => ({ ...prev, y: 100 }))}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                pos.y === 100 ? "bg-lime-500 text-black shadow-md font-black" : "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300"
              }`}
            >
              ⬇️ Abajo (100%)
            </button>
          </div>
        </div>

        {/* Deslizadores de Ajuste Fino */}
        <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800 space-y-3">
          {/* Slider Vertical Y */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-300 w-24 shrink-0">↕️ Vertical (Y):</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={pos.y}
              onChange={(e) => setPos(prev => ({ ...prev, y: parseInt(e.target.value, 10) }))}
              className="flex-1 accent-lime-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-lime-400 w-12 text-right">
              {pos.y}%
            </span>
          </div>

          {/* Slider Horizontal X */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-300 w-24 shrink-0">↔️ Horizontal (X):</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={pos.x}
              onChange={(e) => setPos(prev => ({ ...prev, x: parseInt(e.target.value, 10) }))}
              className="flex-1 accent-pink-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-pink-400 w-12 text-right">
              {pos.x}%
            </span>
          </div>

          {/* Slider Zoom */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-300 w-24 shrink-0">🔍 Zoom:</span>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-purple-400 w-12 text-right">
              {zoom.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-1">
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