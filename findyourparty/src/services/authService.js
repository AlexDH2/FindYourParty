import { supabase } from '../lib/supabase';

export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Cerrar sesión
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener rol del usuario conectado desde tu tabla profiles
  getCurrentUserRole: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 1. Revisar metadata de la sesión
      if (user.user_metadata?.role) {
        return user.user_metadata.role;
      }

      // 2. Consultar en la tabla profiles por ID o username
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .or(`id.eq.${user.id},username.eq.${user.email}`)
        .single();

      return profile?.role || 'admin';
    } catch (err) {
      console.error('Error al obtener rol del usuario:', err);
      return 'admin';
    }
  },

  // Registrar nuevo administrador asignando 'admin' o 'superadmin'
  registerAdmin: async (email, password, role = 'admin') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role
        }
      }
    });

    if (error) throw error;

    if (data?.user) {
      // Guardar en la tabla profiles con las columnas existentes
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: email,
        role: role
      });
    }

    return data;
  }
};