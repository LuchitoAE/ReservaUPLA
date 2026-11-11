import { Icono } from '../ui/Icono'
import { LineaDeTiempo } from './LineaDeTiempo'
import { MensajeDeDisponibilidad } from './MensajeDeDisponibilidad'
import { hayLineaDeTiempo, subtituloDe } from './disponibilidad'

// La tarjeta de disponibilidad del formulario (diseño S04). Mientras se llena la reserva, al costado del formulario,
// dice si el horario está libre (RF-04) y dibuja el día del ambiente en una línea de tiempo. El solicitante elige otro
// horario sin adivinar (prevención de errores) y ve el resultado de cada cambio al instante (feedback).
export function PanelDisponibilidad({ disponibilidad, ambiente, fecha, solicitud }) {
  const { estado, reservasDelDia } = disponibilidad
  const mostrarSolicitud = estado === 'libre'
  const hayLinea = hayLineaDeTiempo({ estado, reservasDelDia, solicitud })

  return (
    <section
      aria-labelledby="titulo-disponibilidad"
      className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta"
    >
      <div className="flex items-start gap-3">
        <Icono nombre="pendiente" className="mt-0.5 size-6 text-info" />
        <div className="min-w-0">
          <h3 id="titulo-disponibilidad" className="text-lg font-semibold text-titulo">
            Disponibilidad
          </h3>
          <p className="text-sm text-texto-suave">{subtituloDe(ambiente, fecha)}</p>
        </div>
      </div>

      <MensajeDeDisponibilidad disponibilidad={disponibilidad} solicitud={solicitud} />

      {hayLinea && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-texto-suave uppercase">
            Ese día, este ambiente tiene:
          </p>
          <LineaDeTiempo reservasDelDia={reservasDelDia} solicitud={solicitud} mostrarSolicitud={mostrarSolicitud} />
        </div>
      )}

      <p className="text-sm text-texto-suave">
        Solo bloquean el horario las reservas aprobadas. Si otra persona pidió la misma hora, el administrador decide.
      </p>
    </section>
  )
}
