import { useState } from "react"
import { authService } from "../services/authService" // Import authService
import { supabase } from "../lib/supabase"; // Importar supabase para obtener el perfil
import { useNavigate } from "react-router-dom"

function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()

  async function handleLogin(e) {

    e.preventDefault()

    try {
      const { user } = await authService.login(email, password); // Obtener el objeto user

      // Obtener el perfil del usuario para determinar el rol
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Si no se encuentra un perfil, o el rol no es 'admin', redirigir a /portal-fyp-2026
      if (!profile || profile.role !== 'admin') {
        navigate("/portal-fyp-2026");
      } else {
        // Si el rol es 'admin', redirigir a /admin
        navigate("/admin");
      }
    } catch (error) {
      alert(error.message)
      console.error("Error al iniciar sesión:", error);
    }
  }

  return (

    <div className="min-h-screen bg-black flex items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md"
      >

        <h1 className="text-white text-4xl font-black mb-8">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-4 rounded-xl"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-6 rounded-xl"
        />

        <button
          className="w-full bg-purple-600 py-4 rounded-xl text-white font-bold"
        >
          Ingresar
        </button>

      </form>

    </div>

  )
}

export default Login