import { formatearFechaLarga } from '../../utils/fechas'
import { AlertMessage } from '../ui/AlertMessage'
import { Button } from '../ui/Button'
import { InsigniaDeEstado } from '../ui/InsigniaDeEstado'

// Lo que ve el solicitante al registrar (diseño S08): el aviso verde con el código para seguir su solicitud, los datos
// en una lista limpia y las dos salidas (ver el detalle o pedir otra). El aviso flotante ya confirmó el registro.
export function ConfirmacionReserva({ reserva, alSolicitarOtra }) {
  return (
    <div className="flex flex-col gap-5">
      <AlertMessage
        tipo="exito"
        titulo={`Reserva ${reserva.codigo_reserva} registrada.`}
        anunciar={false}
      >
        <p className="text-sm">Queda pendiente hasta que un administrador la apruebe o la rechace.</p>
      </AlertMessage>
      <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-superficie p-5 sm:grid-cols-[10rem_1fr]">
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
