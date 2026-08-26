// Re-exportamos EventContext desde su archivo dedicado para que el resto de la
// app siga importándolo desde "./EventContext" sin enterarse del split interno
// (cumple la regla react-refresh/only-export-components).
import { useEffect, useState, useCallback } from "react" // Removido useRef

import { eventService } from "../services/eventService"
import { reservationService } from "../services/reservationService"
import { slugify } from "../utils/slugify"
import { parseNewPricesJsonString, getMinActivePrice } from "../utils/priceUtils"
import { EventContext } from "./eventContextValue"
import { REFRESH_INTERVAL_MS } from "../constants" // Importar la constante

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
  }, [])

  useEffect(() => {
    // Carga inicial desde Supabase (sistema externo) y refresh periódico. El
    // setState dentro del effect es legítimo para sincronizar con el backend.
    void loadEvents()
    void loadReservations()

    const refreshInterval = setInterval(() => {
      void loadEvents()
      void loadReservations()
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(refreshInterval);
  }, [loadEvents, loadReservations, enrichEventWithLifecycle]);

  async function addEvent(newEvent) {
    // newEvent.prices_json now directly contains the new conceptual structure (array of ticketTypes)
    const minPrice = getMinActivePrice(newEvent.prices_json, new Date());

    const eventToAdd = {
      // Excluir propiedades que no son columnas de la DB y ser explícitos con las que sí lo son
      title: newEvent.title,
      location: newEvent.location,
      date: newEvent.date,
      featured: newEvent.featured,
      image: newEvent.image,
      maps: newEvent.maps,
      whatsapp: newEvent.whatsapp,
      description: newEvent.description,
      local_distribution_image: newEvent.local_distribution_image,
      opening_time: newEvent.opening_time,
      dresscode: newEvent.dresscode,
      min_age: newEvent.min_age,
      organizer_id: newEvent.organizer_id === "" ? null : newEvent.organizer_id, // Normalize "" to null
      slug: slugify(newEvent.title), // Generar slug
      price: minPrice, // Establecer precio mínimo (este sí es una columna)
      publication_status: newEvent.publication_status || "draft", // Default a draft
    };

    try {
      const created = await eventService.addEvent({
        ...eventToAdd, // Pass all new fields
        prices_json: JSON.stringify(eventToAdd.prices_json) // Asegurar que se guarda como string JSON
      })

      if (created) {
        setEvents((prev) => [created, ...prev])
      }
    } catch (error) {
      console.error("Error al insertar evento en Supabase:", error)
    }
  }

  async function deleteEvent(id) {
    try {
      await eventService.deleteEvent(id)
      setEvents((prev) => prev.filter((event) => event.id !== id))
    } catch (error) {
      console.error("Error al eliminar evento:", error)
    }
  }

  async function updateEvent(updatedEvent) {
    // updatedEvent.prices_json now directly contains the new conceptual structure (array of ticketTypes)
    const minPrice = getMinActivePrice(updatedEvent.prices_json, new Date());
    
    // Desestructurar updatedEvent para excluir lifecycleStatus y otras propiedades no de DB
    // y construir un objeto con solo las columnas de la base de datos.
    const { lifecycleStatus, ...dbFields } = updatedEvent;

    const eventToUpdate = {
      ...dbFields,
      // Asegurarse de que prices_json se guarde como string JSON
      prices_json: JSON.stringify(updatedEvent.prices_json),
      // Regenerar slug por si el título cambió
      slug: slugify(updatedEvent.title), // Regenerar slug por si el título cambió
      price: minPrice, // Actualizar precio mínimo
      publication_status: updatedEvent.publication_status || "draft",
      // Asegurarse de que organizer_id se envíe correctamente
      organizer_id: updatedEvent.organizer_id || null,
      // Incluir los nuevos campos
      dresscode: updatedEvent.dresscode || null,
      min_age: updatedEvent.min_age || null,
      opening_time: updatedEvent.opening_time || null,
    };

    try {
      const updated = await eventService.updateEvent(eventToUpdate) // Usar eventToUpdate
      if (updated) {
        setEvents((prev) => prev.map((e) =>
          e.id === updatedEvent.id ? { ...enrichEventWithLifecycle(updated), prices_json: parseNewPricesJsonString(updated.prices_json) } : e
        ));
      }
    } catch (error) {
      console.error("Error al actualizar evento:", error)
    }
  }

  async function createReservation(eventId, ticketType, ticketStage, unitPrice, quantity) {
    try {
      await reservationService.createReservation({
        event_id: eventId,
        ticket_type: ticketType,
        ticket_stage: ticketStage, // New field
        unit_price: unitPrice,     // New field
        quantity: quantity
      });
      await loadReservations()
    } catch (error) {
      console.error("Reservation error:", error)
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
