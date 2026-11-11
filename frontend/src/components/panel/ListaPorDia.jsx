import { Link } from 'react-router'
import { InsigniaDeEstado } from '../ui/InsigniaDeEstado'
import { nombreDelDia } from './agendaDeLaSemana'

// Teléfono: solo los días que tienen reservas, cada uno con su lista y el enlace al detalle.
export function ListaPorDia({ dias, bloques }) {
  const conReservas = dias.filter((_, indice) => bloques.some((bloque) => bloque.dia === indice))
  if (conReservas.length === 0) {
    return <p className="text-texto-suave md:hidden">Este ambiente no tiene reservas esta semana.</p>
  }
  return (
    <div className="flex flex-col gap-4 md:hidden">
      {conReservas.map((dia) => (
        <div key={dia}>
          <h3 className="mb-1 font-semibold text-texto first-letter:uppercase">
            {nombreDelDia(dia, { weekday: 'long', day: 'numeric' })}
          </h3>
          <ul className="flex flex-col gap-2">
            {bloques
              .filter((bloque) => bloque.dia === dias.indexOf(dia))
              .sort((a, b) => a.arriba - b.arriba)
              .map(({ reserva }) => (
                <li key={reserva.id_reserva}>
                  <Link
                    to={`/reservas/${reserva.id_reserva}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-borde px-3 py-2 hover:bg-superficie-tenue focus-visible:outline-3 focus-visible:outline-foco"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold tabular-nums">
                        {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
                      </span>
                      <span className="block text-sm text-texto-suave">
                        {reserva.codigo_reserva} · {reserva.nombre_completo_usuario}
                      </span>
                    </span>
                    <InsigniaDeEstado estado={reserva.estado_reserva} />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
