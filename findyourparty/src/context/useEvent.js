import { useEffect, useState, useCallback } from "react"
import { eventService } from "../services/eventService"

/**
 * Hook para obtener los datos de un único evento por su ID,
 * incluyendo su organizador y tipos de entrada.
 * @param {string | number} eventId - El ID del evento a cargar.
 * @returns {{event: object | null, isLoading: boolean, error: Error | null}}
 */
export function useEvent(eventId) {
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvent = useCallback(async () => {
    if (!eventId) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await eventService.getEventById(eventId)
      setEvent(data)
    } catch (err) {
      setError(err)
      console.error(`Error fetching event ${eventId}:`, err)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    void fetchEvent()
  }, [fetchEvent])

  return { event, isLoading, error, refetch: fetchEvent }
}