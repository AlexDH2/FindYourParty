// Re-exportamos EventContext desde su archivo dedicado para que el resto de la
// app siga importándolo desde "./EventContext" sin enterarse del split interno
// (cumple la regla react-refresh/only-export-components).
import { useEffect, useState, useCallback } from "react"

import { eventService } from "../services/eventService"
import { reservationService } from "../services/reservationService"
import { slugify } from "../utils/slugify"
import { parseNewPricesJsonString, getMinActivePrice } from "../utils/priceUtils"
import { EventContext } from "./eventContextValue"
import { queryClient } from "../queryClient"
import { cacheService } from "../services/cacheService"

export { EventContext }

export function EventProvider({ children }) {
  const [events, setEvents] = useState([])
  const [reservations, setReservations] = useState([])

  // Helper to enrich event with lifecycle status (kept internal for now)
  const enrichEventWithLifecycle = useCallback((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    // Simplified lifecycle for now, will be more robust with Supabase triggers
    if (now > eventDate) return { ...event, lifecycleStatus: "finalizado" };
    return { ...event, lifecycleStatus: "activo" };
  }, []);

  const loadReservations = useCallback(async () => {
    try {
      const data = await reservationService.listReservationsWithEventTitle()
      setReservations(data)
    } catch (error) {
      console.error("Error al cargar reservas:", error)
    }
  }, [])

  const loadEvents = useCallback(async () => {
    try {
      const eventsRaw = await eventService.listEvents()
      const enrichedEvents = eventsRaw.map(event => ({
        ...enrichEventWithLifecycle(event),
        prices_json: parseNewPricesJsonString(event.prices_json), // Parse prices_json on load
      }));
      setEvents(enrichedEvents)
    } catch (error) {
      console.error("Error al cargar eventos:", error)
    }
  }, [enrichEventWithLifecycle])

  useEffect(() => {
    // Carga inicial desde Supabase (sistema externo).
    // Polling eliminado: TanStack Query maneja la caché y deduplicación
    // para la página pública. El contexto solo sirve para datos de admin.
    void loadEvents()
    void loadReservations()
  }, [loadEvents, loadReservations]);

  /** Invalida caché pública tras cambios en eventos */
  function invalidatePublicCache() {
    cacheService.clear()
    queryClient.invalidateQueries({ queryKey: ["public-events"] })
    queryClient.invalidateQueries({ queryKey: ["public-event"] })
  }

  async function addEvent(newEvent) {
    const minPrice = getMinActivePrice(newEvent.prices_json, new Date());

    const eventToAdd = {
      ...newEvent,
      organizer_id: newEvent.organizer_id === "" ? null : newEvent.organizer_id,
      slug: slugify(newEvent.title),
      price: minPrice,
      publication_status: newEvent.publication_status || "draft",
      prices_json: JSON.stringify(newEvent.prices_json || []),
      ...(newEvent.video_url?.trim() ? { video_url: newEvent.video_url.trim() } : {})
    };

    try {
      const created = await eventService.addEvent(eventToAdd)

      if (created) {
        setEvents((prev) => [created, ...prev])
        invalidatePublicCache()
      }
    } catch (error) {
      console.error("Error al insertar evento en Supabase:", error)
    }
  }

  async function deleteEvent(id) {
    try {
      await eventService.deleteEvent(id)
      setEvents((prev) => prev.filter((event) => event.id !== id))
      invalidatePublicCache()
    } catch (error) {
      console.error("Error al eliminar evento:", error)
    }
  }

  async function updateEvent(updatedEvent) {
    const minPrice = getMinActivePrice(updatedEvent.prices_json, new Date());
    const { lifecycleStatus, ...dbFields } = updatedEvent;

    const eventToUpdate = {
      ...dbFields,
      prices_json: JSON.stringify(updatedEvent.prices_json || []),
      slug: slugify(updatedEvent.title),
      price: minPrice,
      publication_status: updatedEvent.publication_status || "draft",
      organizer_id: updatedEvent.organizer_id || null,
      dresscode: updatedEvent.dresscode || null,
      min_age: updatedEvent.min_age || null,
      opening_time: updatedEvent.opening_time || null,
    };

    if (updatedEvent.video_url?.trim()) {
      eventToUpdate.video_url = updatedEvent.video_url.trim();
    } else {
      delete eventToUpdate.video_url;
    }

    try {
      const updated = await eventService.updateEvent(eventToUpdate) // Usar eventToUpdate
      if (updated) {
        setEvents((prev) => prev.map((e) =>
          e.id === updatedEvent.id ? { ...enrichEventWithLifecycle(updated), prices_json: parseNewPricesJsonString(updated.prices_json) } : e
        ));
        invalidatePublicCache()
      }
    } catch (error) {
      console.error("Error al actualizar evento:", error)
    }
  }

  async function createReservation(eventId, ticketType, ticketStage, quantity) {
    try {
      // Usa RPC: no envía unit_price desde el cliente
      const result = await reservationService.createReservation({
        event_id: eventId,
        ticket_type: ticketType,
        ticket_stage: ticketStage,
        quantity: quantity,
      });
      await loadReservations()
      return result // Devuelve {id, ticket_type, ticket_stage, unit_price, quantity, total}
    } catch (error) {
      console.error("Reservation error:", error)
      throw error
    }
  }

  return (
    <EventContext.Provider
      value={{
        events,
        reservations,
        addEvent,
        deleteEvent,
        updateEvent,
        createReservation,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export default EventProvider
