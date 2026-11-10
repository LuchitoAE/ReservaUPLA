import { Link } from 'react-router'
import { InsigniaDeEstado } from '../ui/InsigniaDeEstado'

// '2026-11-10' → { dia: 'MAR', numero: 10, mes: 'NOV' }, para el recuadro de la fecha (diseño S01 y AD01).
function partesDeLaFecha(fecha) {
  const momento = new Date(`${fecha}T12:00:00`)
  const corto = (opciones) => momento.toLocaleDateString('es-PE', opciones).replace('.', '').toUpperCase()
  return { dia: corto({ weekday: 'short' }), numero: momento.getDate(), mes: corto({ month: 'short' }) }
}

// Reservas en filas: el día en un recuadro, el ambiente, el horario y el código (y el solicitante, si se pide), el
// estado y un enlace al detalle. La usan «Mis próximas reservas» y «Pendientes por aprobar» del panel principal.
export function ListaDeReservas({ reservas, vacio, accion = 'Ver', conSolicitante = false }) {
  if (reservas.length === 0) {
    return <p className="py-2 text-texto-suave">{vacio}</p>
  }

  return (
    <ul className="divide-y divide-borde">
      {reservas.map((reserva) => {
        const { dia, numero, mes } = partesDeLaFecha(reserva.fecha_reserva)
        return (
          <li key={reserva.id_reserva} className="flex items-center gap-3 py-3">
            <span className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-seleccion py-1 text-titulo" aria-hidden="true">
              <span className="text-xs font-semibold">{dia}</span>
              <span className="text-xl leading-tight font-bold">{numero}</span>
              <span className="text-xs">{mes}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-texto">{reserva.nombre_ambiente}</p>
              <p className="text-sm text-texto-suave">
                <span className="tabular-nums">
                  {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
                </span>
                {conSolicitante && ` · ${reserva.nombre_completo_usuario}`} · {reserva.codigo_reserva}
              </p>
              <span className="sr-only">{`${dia} ${numero} ${mes}`}</span>
            </div>
            <span className="hidden sm:inline">
              <InsigniaDeEstado estado={reserva.estado_reserva} />
            </span>
            <Link
              to={`/reservas/${reserva.id_reserva}`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 font-semibold text-enlace underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-foco"
            >
              {accion}
              <span className="sr-only"> la reserva {reserva.codigo_reserva}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
