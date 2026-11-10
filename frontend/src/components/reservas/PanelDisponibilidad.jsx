import { AlertMessage } from '../ui/AlertMessage'
import { InsigniaDeEstado } from '../ui/InsigniaDeEstado'

// Muestra, mientras se llena el formulario, si el horario está libre (RF-04) y qué reservas tiene ese ambiente ese
// día: el solicitante elige otro horario sin adivinar (prevención de errores) y ve el resultado de cada cambio al
// instante (feedback informativo). Va junto a las horas que lo deciden (Norman: relación visible). Se anuncia sin
// interrumpir.
export function PanelDisponibilidad({ disponibilidad }) {
  const { estado, mensaje, reservasDelDia } = disponibilidad

  return (
    <section aria-labelledby="titulo-disponibilidad" className="flex flex-col gap-3 rounded-lg border border-borde bg-superficie-tenue p-4">
      <h3 id="titulo-disponibilidad" className="font-semibold text-titulo">
        Disponibilidad del ambiente
      </h3>
      <div aria-live="polite">
        {estado === 'espera' && <p className="text-texto-suave">Elija el ambiente, la fecha y las horas: aquí verá si el horario está libre.</p>}
        {estado === 'consultando' && <p className="text-texto-suave">Revisando la disponibilidad…</p>}
        {estado === 'libre' && <AlertMessage tipo="exito" titulo="Horario libre.">{mensaje}</AlertMessage>}
        {estado === 'ocupado' && <AlertMessage tipo="aviso" titulo="Horario ocupado.">{mensaje}</AlertMessage>}
        {estado === 'error' && <AlertMessage tipo="aviso" titulo="No se pudo revisar la disponibilidad.">{mensaje}</AlertMessage>}
      </div>
      {reservasDelDia.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-texto-suave">Ese día, este ambiente tiene:</p>
          <ul className="flex flex-col gap-1.5">
            {reservasDelDia.map((reserva) => (
              <li key={reserva.codigo_reserva} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold tabular-nums">
                  {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
                </span>
                <span className="text-texto-suave">{reserva.codigo_reserva}</span>
                <InsigniaDeEstado estado={reserva.estado_reserva} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
