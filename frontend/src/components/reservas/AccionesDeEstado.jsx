import { useState } from 'react'
import { cambiarEstadoDeReserva } from '../../api/reservasApi'
import { avisoDeError } from '../../utils/avisoDeError'
import { AlertMessage } from '../ui/AlertMessage'
import { Button } from '../ui/Button'
import { ModalConfirmacion } from '../ui/ModalConfirmacion'

// Cómo se presenta cada acción: el botón, la pregunta de confirmación y lo que pasa después.
const ACCIONES = {
  Aprobada: {
    boton: 'Aprobar',
    variante: 'aprobar',
    pregunta: '¿Aprobar la reserva?',
    efecto: 'El ambiente quedará ocupado en ese horario y nadie más podrá reservarlo (RN-01).',
  },
  Rechazada: {
    boton: 'Rechazar',
    variante: 'peligro',
    pregunta: '¿Rechazar la reserva?',
    efecto: 'Una reserva rechazada ya no puede modificarse (RN-06).',
  },
  Cancelada: {
    boton: 'Cancelar reserva',
    variante: 'peligro',
    pregunta: '¿Cancelar la reserva?',
    efecto: 'El horario quedará libre y la reserva ya no podrá reactivarse.',
  },
}

// RF-07: las acciones que el usuario actual puede hacer con esta reserva. El estado actual dice a cuáles puede pasar
// (lo envía la API) y el rol decide cuáles se muestran (RN-05). La API vuelve a comprobar ambas cosas.
export function AccionesDeEstado({ reserva, usuarioActual, alCambiar }) {
  const [elegida, setElegida] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const esAdministrador = usuarioActual?.rol_usuario === 'Administrador'
  const esSolicitante = usuarioActual?.id_usuario === reserva.id_usuario
  const permitidas = reserva.estados_siguientes_reserva.filter((estado) =>
    estado === 'Cancelada' ? esAdministrador || esSolicitante : esAdministrador,
  )

  async function confirmar() {
    setEnviando(true)
    try {
      const respuesta = await cambiarEstadoDeReserva(reserva.id_reserva, elegida, usuarioActual.id_usuario)
      setElegida(null)
      setAviso(null)
      alCambiar(respuesta)
    } catch (error) {
      setElegida(null)
      setAviso(avisoDeError(error))
    } finally {
      setEnviando(false)
    }
  }

  const accion = elegida ? ACCIONES[elegida] : null

  return (
    <section aria-labelledby="titulo-acciones" className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5">
      <h2 id="titulo-acciones" className="text-lg font-semibold text-titulo">
        Acciones
      </h2>
      {aviso && <AlertMessage tipo="error" aviso={aviso} />}
      {reserva.estados_siguientes_reserva.length === 0 ? (
        <p className="text-texto-suave">Esta reserva está {reserva.estado_reserva.toLowerCase()}: ya no cambia de estado.</p>
      ) : !usuarioActual ? (
        <p className="text-texto-suave">Elija el usuario actual en la barra lateral para ver sus acciones.</p>
      ) : permitidas.length === 0 ? (
        <p className="text-texto-suave">Solo un administrador puede aprobar o rechazar; cancelar, quien la solicitó.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {permitidas.map((estado) => (
            <Button key={estado} variante={ACCIONES[estado].variante} onClick={() => setElegida(estado)}>
              {ACCIONES[estado].boton}
            </Button>
          ))}
        </div>
      )}
      <ModalConfirmacion
        abierto={Boolean(accion)}
        titulo={accion?.pregunta}
        textoConfirmar={accion?.boton}
        variante={accion?.variante}
        ocupado={enviando}
        alConfirmar={confirmar}
        alCancelar={() => setElegida(null)}
      >
        <p>
          <strong className="text-texto">{reserva.codigo_reserva}</strong> · {reserva.nombre_ambiente},{' '}
          {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}.
        </p>
        <p className="mt-2">{accion?.efecto}</p>
      </ModalConfirmacion>
    </section>
  )
}
