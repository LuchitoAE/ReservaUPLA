import { formatearFechaLarga } from '../../utils/fechas'
import { Button } from '../ui/Button'
import { InsigniaDeEstado } from '../ui/InsigniaDeEstado'

// Lo que ve el solicitante al registrar: el código para seguir su solicitud y que queda pendiente de aprobación. El
// aviso flotante ya confirmó el registro (RNF-04): aquí basta un título.
export function ConfirmacionReserva({ reserva, alSolicitarOtra }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-titulo">Reserva {reserva.codigo_reserva} registrada</h2>
        <p className="text-texto-suave">Queda pendiente hasta que un administrador la apruebe o la rechace.</p>
      </div>
      <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-borde bg-superficie p-5 sm:grid-cols-[10rem_1fr]">
        <dt className="text-texto-suave">Código</dt>
        <dd className="font-semibold">{reserva.codigo_reserva}</dd>
        <dt className="text-texto-suave">Ambiente</dt>
        <dd>{reserva.nombre_ambiente}</dd>
        <dt className="text-texto-suave">Fecha</dt>
        <dd className="inline-block first-letter:uppercase">{formatearFechaLarga(reserva.fecha_reserva)}</dd>
        <dt className="text-texto-suave">Horario</dt>
        <dd className="tabular-nums">
          {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
        </dd>
        <dt className="text-texto-suave">Estado</dt>
        <dd>
          <InsigniaDeEstado estado={reserva.estado_reserva} />
        </dd>
      </dl>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button destino={`/reservas/${reserva.id_reserva}`} variante="principal">
          Ver detalle
        </Button>
        <Button onClick={alSolicitarOtra}>Solicitar otra reserva</Button>
      </div>
    </div>
  )
}
