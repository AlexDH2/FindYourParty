import { supabase } from "../lib/supabase";

export const reservationService = {
  /**
   * Lista reservas con título de evento (solo para admins).
   */
  async listReservationsWithEventTitle() {
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, events(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching reservations with event title:", error);
      return [];
    }
  },

  /**
   * Crea una reserva pública usando el RPC de Supabase.
   * NO envía unit_price desde el cliente; el servidor lo calcula.
   * Devuelve: { id, ticket_type, ticket_stage, unit_price, quantity, total }
   */
  async createReservation({ event_id, ticket_type, ticket_stage, quantity }) {
    try {
      const { data, error } = await supabase.rpc("create_public_reservation", {
        p_event_id: event_id,
        p_entry_type: ticket_type,
        p_stage: ticket_stage,
        p_quantity: quantity,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating reservation via RPC:", error);
      throw error;
    }
  },

  async getHistory() {
    try {
      const { data, error } = await supabase
        .from("reservations_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching reservation history:", error);
      return [];
    }
  },
};