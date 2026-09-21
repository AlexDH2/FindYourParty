import { useEffect, useState } from "react"

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="mx-6 mt-6">
        <div
          className={`
            px-8 py-4
            flex justify-between items-center
            transition-all duration-500
            ${
              scrolled
                ? `
                  backdrop-blur-2xl
                  bg-black/40
                  border border-white/10
                  rounded-full
                `
                : `
                  bg-transparent
                `
            }
          `}
        >
          {/* LOGO RECCORTADO TRANSPARENTE */}
          <a href="/" className="flex items-center transition transform hover:scale-105 active:scale-95">
            <img 
              src="/FYP.png" 
              alt="FYP" 
              className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            />
          </a>

          <div className="hidden md:flex gap-10 text-sm uppercase tracking-widest text-zinc-300">
            <a href="/#eventos" className="hover:text-purple-400 transition font-medium">
              Eventos
            </a>
            <a href="/#contacto" className="hover:text-purple-400 transition font-medium">
              Contacto
            </a>
          </div>

          <button 
            className="md:hidden text-white hover:text-purple-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 text-sm uppercase tracking-widest text-center">
            <a href="/#eventos" className="text-white hover:text-purple-400 transition font-medium" onClick={() => setIsMenuOpen(false)}>
              Eventos
            </a>
            <a href="/#contacto" className="text-white hover:text-purple-400 transition font-medium" onClick={() => setIsMenuOpen(false)}>
              Contacto
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar