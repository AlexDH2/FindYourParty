import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <main>
        <Outlet />
      </main>
      
      {/* Global Footer */}
      <footer id="contacto" className="border-t border-zinc-900 py-20 text-center bg-zinc-950/20">
        <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          FIND YOUR PARTY
        </h2>
        <p className="text-zinc-600 mt-3 text-xs uppercase tracking-[0.3em]">Descubre. Reserva. Disfruta.</p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="https://instagram.com/findyourparty"
            target="_blank"
            rel="noreferrer"
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-6 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition text-sm"
          >
            Instagram
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
