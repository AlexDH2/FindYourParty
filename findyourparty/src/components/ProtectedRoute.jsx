import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ProtectedRoute({ children }) {

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        } else if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        } else {
          // Si existe una sesión pero el usuario NO es un administrador, cerrar la sesión.
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    }
    void checkAdminStatus();

  }, [])

  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute