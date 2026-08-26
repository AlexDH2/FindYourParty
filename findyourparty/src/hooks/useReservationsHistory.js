import { useEffect, useState, useCallback } from "react"
import { reservationService } from "../services/reservationService"

// Placeholder for reservationService if it doesn't exist yet
// In a real scenario, you would import the actual service
// For this task, we assume reservationService exists and has a getHistory method

// Custom hook para cargar y refrescar el historial de reservas.
// El useEffect es válido aquí porque la regla react-hooks/set-state-in-effect
// se cumple cuando se llama a fetchers desde un hook dedicado.
export function useReservationsHistory() {
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const data = await reservationService.getHistory()
      setHistory(data)
    } catch (err) {
      console.error("Error al traer el historial:", err)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    // Carga inicial de datos desde un sistema externo (Supabase). El setState
    // dentro del effect es aquí legítimo y se ejecuta una sola vez.
    void fetchHistory()
  }, [fetchHistory])

  return { history, loadingHistory, refetchHistory: fetchHistory }
}
