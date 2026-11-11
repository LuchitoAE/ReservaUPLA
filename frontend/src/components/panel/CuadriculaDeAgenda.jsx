import { Link } from 'react-router'
import { HORAS_DE_LA_AGENDA, nombreDelDia } from './agendaDeLaSemana'

// Colores de los bloques: aprobada en verde y pendiente en ámbar (RNF-05).
const ESTILOS = {
  Aprobada: 'border-exito bg-aprobada-fondo text-aprobada-texto',
  Pendiente: 'border-aviso bg-pendiente-fondo text-pendiente-texto',
}

// La cuadrícula mide 15 horas; cada una ocupa el mismo alto.
const ALTO_DE_LA_AGENDA = 'h-[37.5rem]'

// Escritorio: las horas a la izquierda y un día por columna; cada bloque lleva al detalle de la reserva.
export function CuadriculaDeAgenda({ dias, bloques }) {
  return (
    <div className="hidden grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] md:grid" aria-hidden="false">
      <span />
      {dias.map((dia) => (
        <p key={dia} className="pb-2 text-sm font-semibold text-texto-suave uppercase">
          {nombreDelDia(dia, { weekday: 'short' })} {Number(dia.slice(8))}
        </p>
      ))}
      <div className={`relative ${ALTO_DE_LA_AGENDA}`}>
        {HORAS_DE_LA_AGENDA.map((hora, indice) => (
          <span
            key={hora}
            className="absolute -translate-y-1/2 text-xs text-texto-suave tabular-nums"
            style={{ top: `${(indice / HORAS_DE_LA_AGENDA.length) * 100}%` }}
          >
            {hora}
          </span>
        ))}
      </div>
      {dias.map((dia, indice) => (
        <div
          key={dia}
          className={`relative ${ALTO_DE_LA_AGENDA} border-l border-borde bg-[repeating-linear-gradient(to_bottom,var(--color-borde)_0_1px,transparent_1px_2.5rem)]`}
        >
          {bloques
            .filter((bloque) => bloque.dia === indice)
            .map(({ reserva, arriba, alto }) => (
              <Link
                key={reserva.id_reserva}
                to={`/reservas/${reserva.id_reserva}`}
                aria-label={`${reserva.codigo_reserva}, ${reserva.estado_reserva.toLowerCase()}, ${nombreDelDia(dia, { weekday: 'long', day: 'numeric' })}, de ${reserva.hora_inicio_reserva} a ${reserva.hora_fin_reserva}, ${reserva.nombre_completo_usuario}`}
                className={`absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-xs leading-tight hover:brightness-95 focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-foco ${ESTILOS[reserva.estado_reserva]}`}
                style={{ top: `${arriba}%`, height: `${alto}%` }}
              >
                <span className="block font-semibold">{reserva.codigo_reserva}</span>
                <span className="block tabular-nums">
                  {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva} · {reserva.nombre_completo_usuario}
                </span>
              </Link>
            ))}
        </div>
      ))}
    </div>
  )
}
