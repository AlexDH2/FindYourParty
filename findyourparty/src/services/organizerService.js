import { supabase } from "../lib/supabase";
import { slugify } from "../utils/slugify";

export const organizerService = {
  async listOrganizers() {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching organizers:", error);
      return [];
    }
  },

  async addOrganizer(organizerData) {
    try {
      const { name, ...rest } = organizerData;
      const slug = slugify(name);
      const { data, error } = await supabase
        .from('organizers')
        .insert([{ name, slug, ...rest }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error adding organizer:", error);
      throw error;
    }
  },

  async updateOrganizer(organizerData) {
    try {
      const { id, name, ...updateFields } = organizerData;
      const slug = slugify(name); // Regenerar slug por si el nombre cambió
      const { data, error } = await supabase
        .from('organizers')
        .update({ name, slug, ...updateFields })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error updating organizer:", error);
      throw error;
    }
  },

  // Puedes añadir funciones para eliminar organizadores, obtener por slug, etc.
};