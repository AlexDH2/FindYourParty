import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-[1000] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
        404
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-4">
        Ups, esta fiesta no existe
      </h1>
      <p className="text-zinc-400 text-sm mb-8 max-w-md">
        Parece que el evento al que intentas acceder fue cancelado, cambió de nombre o te pasaron mal la ubicación VIP.
      </p>
      <Link
        to="/"
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity"
      >
        Volver a la Cartelera
      </Link>
    </div>
  );
}
