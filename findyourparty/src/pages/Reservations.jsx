import { useContext } from "react"
import { EventContext } from "../context/EventContext"

function Reservations() {

  const {
    reservations

  } = useContext(EventContext)

  return (

    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-5xl font-black mb-10">
        Reservas
      </h1>

      <div className="grid gap-6">

        {reservations.length > 0 ? (

          reservations.map((reservation) => (

            <div
              key={reservation.id}
              className="bg-zinc-900 rounded-3xl p-6"
            >

              <h2 className="text-3xl font-black">
                {reservation.events?.title || "Evento eliminado"}
              </h2>

              {reservation.ticket_type && (
                <p className="text-purple-400 mt-1 text-sm font-bold">Tipo de entrada: {reservation.ticket_type}</p>
              )}
              {reservation.ticket_stage && (
                <p className="text-purple-400 mt-1 text-sm font-bold">Etapa de venta: {reservation.ticket_stage}</p>
              )}

              <p className="text-zinc-400 mt-2">
                Cantidad reservada: {reservation.quantity}
              </p>

              {reservation.unit_price && (
                <p className="text-lime-400 mt-1 text-sm font-bold">Precio unitario: S/.{reservation.unit_price}</p>
              )}

              <p className="text-zinc-500 mt-1 text-sm">
                ID evento: {reservation.event_id}
              </p>

            </div>

          ))

        ) : (

          <div className="text-zinc-400">
            Aún no hay reservas.
          </div>

        )}

      </div>

    </div>

  )

}

export default Reservations