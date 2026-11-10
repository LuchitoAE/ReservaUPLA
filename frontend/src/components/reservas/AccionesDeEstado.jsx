import { useState } from 'react'
import { cambiarEstadoDeReserva } from '../../api/reservasApi'
import { useAviso } from '../../hooks/useAviso'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { avisoDeError } from '../../utils/avisoDeError'
import { AlertMessage } from '../ui/AlertMessage'
import { Button } from '../ui/Button'
import { ModalConfirmacion } from '../ui/ModalConfirmacion'
import { cruceAprobado, situacionDeLaReserva } from './situacionDeLaReserva'

// Cómo se presenta cada acción: el botón, la pregunta de confirmación, lo que pasa después y el verbo para el error.
const ACCIONES = {
  Aprobada: {
    boton: 'Aprobar',
    verbo: 'aprobar',
    variante: 'aprobar',
    pregunta: '¿Aprobar la reserva?',
    efecto: 'El ambiente quedará ocupado en ese horario y nadie más podrá reservarlo.',
  },
  Rechazada: {
    boton: 'Rechazar',
    verbo: 'rechazar',
    variante: 'peligro',
    pregunta: '¿Rechazar la reserva?',
    efecto: 'Una reserva rechazada ya no puede modificarse.',
  },
  Cancelada: {
    boton: 'Cancelar reserva',
    verbo: 'cancelar',
    variante: 'peligro',
    pregunta: '¿Cancelar la reserva?',
    efecto: 'El horario quedará libre y la reserva ya no podrá reactivarse.',
  },
}

// RF-07: en qué está la reserva y lo que el usuario actual puede hacer con ella. El estado actual dice a cuáles puede
// pasar (lo envía la API) y el rol decide cuáles se muestran (RN-05); la API vuelve a comprobar ambas cosas.
// La situación va en un mensaje de alto fijo (RNF-04: la tarjeta no cambia de tamaño) con el color del semáforo; si
// una pendiente choca con una aprobada, se ve en ámbar y «Aprobar» queda deshabilitado (RN-01, diseño AD09). El
// resultado de cada acción, o su error, sale en un aviso flotante.
export function AccionesDeEstado({ reserva, usuarioActual, alCambiar }) {
  const mostrarAviso = useAviso()
  const [elegida, setElegida] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const esAdministrador = usuarioActual?.rol_usuario === 'Administrador'
  const esSolicitante = usuarioActual?.id_usuario === reserva.id_usuario
  const permitidas = reserva.estados_siguientes_reserva.filter((estado) =>
    estado === 'Cancelada' ? esAdministrador || esSolicitante : esAdministrador,
  )

  // Solo el administrador decide una pendiente: para él se revisa si el horario ya lo ocupa otra aprobada.
  const revisarCruce = esAdministrador && reserva.estado_reserva === 'Pendiente'
  const disponibilidad = useDisponibilidad(reserva, revisarCruce)
  const cruce = revisarCruce ? cruceAprobado(reserva, disponibilidad.reservasDelDia) : null
  const situacion = situacionDeLaReserva(reserva, { esAdministrador, cruce })

  async function confirmar() {
    const accion = ACCIONES[elegida]
    setEnviando(true)
    try {
      const respuesta = await cambiarEstadoDeReserva(reserva.id_reserva, elegida)
      alCambiar(respuesta)
    } catch (error) {
      mostrarAviso({ tipo: 'error', titulo: `No se pudo ${accion.verbo} la reserva`, texto: avisoDeError(error).mensaje })
    } finally {
      setElegida(null)
      setEnviando(false)
    }
  }

  const accion = elegida ? ACCIONES[elegida] : null

  return (
    <section aria-labelledby="titulo-acciones" className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5">
      <h2 id="titulo-acciones" className="text-lg font-semibold text-titulo">
        Estado y acciones
      </h2>
      <AlertMessage tipo={situacion.tipo} titulo={situacion.titulo} anunciar={false} className="min-h-28">
        <p id="situacion-reserva" className="text-sm">
          {situacion.texto}
        </p>
      </AlertMessage>
      {permitidas.length === 0 && reserva.estados_siguientes_reserva.length > 0 && (
        <p className="text-sm text-texto-suave">Solo un administrador puede aprobar o rechazar; cancelar, quien la solicitó.</p>
      )}
      {permitidas.length > 0 && (
        <div className="flex flex-col gap-2">
          {permitidas.map((estado) => {
            const bloqueado = estado === 'Aprobada' && !situacion.sePuedeAprobar
            return (
              <Button
                key={estado}
                variante={ACCIONES[estado].variante}
                disabled={bloqueado}
                aria-describedby={bloqueado ? 'situacion-reserva' : undefined}
                onClick={() => setElegida(estado)}
              >
                {ACCIONES[estado].boton}
              </Button>
            )
          })}
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
