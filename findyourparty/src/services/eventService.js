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
      let { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      // Si falla porque no existe la columna video_url en Supabase, reintentar sin video_url
      if (error && error.code === 'PGRST204' && eventData.video_url !== undefined) {
        console.warn("Columna video_url no existe en Supabase aún. Guardando sin video_url...");
        const { video_url, ...dataWithoutVideo } = eventData;
        const retry = await supabase.from('events').insert([dataWithoutVideo]).select();
        data = retry.data;
        error = retry.error;
      }

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
      let { data, error } = await supabase
        .from('events')
        .update(updateFields)
        .eq('id', id)
        .select();

      // Si falla porque no existe la columna video_url en Supabase, reintentar sin video_url
      if (error && error.code === 'PGRST204' && updateFields.video_url !== undefined) {
        console.warn("Columna video_url no existe en Supabase aún. Guardando sin video_url...");
        const { video_url, ...fieldsWithoutVideo } = updateFields;
        const retry = await supabase
          .from('events')
          .update(fieldsWithoutVideo)
          .eq('id', id)
          .select();
        data = retry.data;
        error = retry.error;
      }

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

  // Placeholder para la lógica de purga
  async purgeDeletedEvents({ eventsToDelete }) {
    console.log("Purging deleted events (placeholder):", eventsToDelete);
    return true;
  }
};