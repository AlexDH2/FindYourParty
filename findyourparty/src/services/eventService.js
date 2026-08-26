import { supabase } from "../lib/supabase";

export const eventService = {
  async listEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  async addEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select(); // Retorna el registro insertado

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  },

  async updateEvent(eventData) {
    try {
      const { id, ...updateFields } = eventData;
      const { data, error } = await supabase
        .from('events')
        .update(updateFields)
        .eq('id', id)
        .select(); // Retorna el registro actualizado

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  async deleteEvent(id) {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  // Esta función es un placeholder para la lógica de purga,
  // que podría ser más compleja o manejarse con un trigger de Supabase.
  async purgeDeletedEvents({ eventsToDelete }) {
    console.log("Purging deleted events (placeholder):", eventsToDelete);
    // En un escenario real, aquí se ejecutaría la lógica para eliminar
    // permanentemente los eventos marcados como "deleted" si es necesario.
    // Por ahora, solo se registra.
    return true;
  }
};