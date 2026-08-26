import { useEffect, useState } from "react"

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

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
            <a href="#eventos" className="hover:text-purple-400 transition font-medium">
              Eventos
            </a>
            <a href="#servicios" className="hover:text-purple-400 transition font-medium">
              Servicios
            </a>
            <a href="#galeria" className="hover:text-purple-400 transition font-medium">
              Galería
            </a>
            <a href="#contacto" className="hover:text-purple-400 transition font-medium">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar