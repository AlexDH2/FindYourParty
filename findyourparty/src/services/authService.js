import { supabase } from "../lib/supabase";

export const authService = {
  /**
   * Registra un nuevo usuario en Supabase Auth y actualiza su perfil a 'admin'.
   * Requiere que el usuario que ejecuta esta función tenga permisos para actualizar
   * la tabla 'profiles' (ej. un administrador existente).
   * @param {string} email - El correo electrónico del nuevo administrador.
   * @param {string} password - La contraseña del nuevo administrador.
   * @returns {Promise<{user: object, profile: object}>} El usuario y el perfil actualizados.
   * @throws {Error} Si falla el registro o la actualización del perfil.
   */
  async registerAdmin(email, password) {
    try {
      // 1. Registrar el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("El usuario no fue creado durante el registro.");

      const userId = authData.user.id;

      // 2. Actualizar el perfil del usuario para establecer el rol a 'admin'
      // Esto asume que la política RLS en 'profiles' permite a un administrador existente
      // actualizar otros perfiles, o que esta operación se realiza con privilegios adecuados.
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select(); // Seleccionar el perfil actualizado para confirmar

      if (profileError) {
        console.error("Error al actualizar el rol del perfil a admin:", profileError);
        throw profileError;
      }

      return { user: authData.user, profile: profileData[0] };

    } catch (error) {
      console.error("Error al registrar administrador:", error);
      throw error;
    }
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Error silencioso al cerrar sesion:", e);
    }
    // Forzar limpieza local por seguridad
    localStorage.removeItem('supabase.auth.token'); 
    return true;
  }
};