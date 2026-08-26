import { supabase } from "../lib/supabase"; // Assuming supabase client is imported

export const reservationService = {
  async listReservationsWithEventTitle() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, events(title)') // Unir con la tabla de eventos para obtener el título
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching reservations with event title:", error);
      return [];
    }
  },

  async createReservation({ event_id, ticket_type, ticket_stage, unit_price, quantity }) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([
          { event_id, ticket_type, ticket_stage, unit_price, quantity }
        ])
        .select(); // Para obtener el registro insertado

      if (error) throw error;
      return data[0]; // Retorna el primer registro insertado
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error; // Propagar el error para que el frontend lo maneje
    }
  },

  async getHistory() {
    try {
      const { data, error } = await supabase
        .from('reservations_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching reservation history:", error);
      return [];
    }
  }
};