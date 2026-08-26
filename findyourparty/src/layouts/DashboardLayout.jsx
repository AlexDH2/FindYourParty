import { Outlet, Navigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth'; // Placeholder for future auth

const DashboardLayout = () => {
  // Simple check for now, can be expanded with real auth logic
  const isAuthenticated = true; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#030303] text-white font-sans">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-zinc-850 bg-zinc-950 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-black tracking-tighter text-purple-500">FYP ADMIN</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {['Dashboard', 'Eventos', 'Reservas', 'Organizadores'].map((item) => (
            <div key={item} className="px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors font-bold text-sm">
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight">Panel de Control</h2>
          <div className="flex items-center gap-4">
             {/* User profile placeholder */}
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600" />
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
