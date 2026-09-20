import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // AQUÍ VA TU LÓGICA DE AUTENTICACIÓN (ej. Supabase o Firebase)
      // Ejemplo:
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;

      console.log('Iniciando sesión con:', email);
      // Redirigir al dashboard tras login exitoso:
      // window.location.href = '/admin';
    } catch (err) {
      setErrorMessage(err.message || 'Credenciales de acceso incorrectas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Resplandor ambiental de fiesta/neón de fondo */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Tarjeta principal de Login */}
      <div className="w-full max-w-md relative z-10 bg-[#0f0f14]/90 backdrop-blur-2xl border border-white/10 hover:border-pink-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-300">
        
        {/* Encabezado e identidad FYP */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-pink-400">
              FYP Control Center
            </span>
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tight">
            Admin <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">Login</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Ingresa al panel de gestión de eventos y reservas
          </p>
        </div>

        {/* Mensaje de alerta en caso de error */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Correo */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@findyourparty.com"
                className="w-full pl-11 pr-4 py-3 bg-neutral-900/90 text-white placeholder-neutral-500 text-sm rounded-xl border border-neutral-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-neutral-900/90 text-white placeholder-neutral-500 text-sm rounded-xl border border-neutral-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all duration-200"
              />
              {/* Botón para alternar visibilidad de contraseña */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-pink-400 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:via-fuchsia-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(236,72,153,0.35)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-white/5 text-center">
          <p className="text-[11px] text-neutral-500">
            FindYourParty &copy; 2026 • Acceso exclusivo para administradores
          </p>
        </div>
      </div>
    </div>
  );
}