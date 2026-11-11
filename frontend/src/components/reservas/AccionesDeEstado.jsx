import { useState } from 'react'
import { cambiarEstadoDeReserva } from '../../api/reservasApi'
import { useAviso } from '../../hooks/useAviso'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { avisoDeError } from '../../utils/avisoDeError'
import { TarjetaDeDecision } from './TarjetaDeDecision'
import { ACCIONES, presentacionDeLaDecision } from './configuracionDeAcciones'
import { cruceAprobado, situacionDeLaReserva } from './situacionDeLaReserva'

// RF-07: en qué está la reserva y lo que el usuario actual puede hacer con ella. El estado actual dice a cuáles puede
// pasar (lo envía la API) y el rol decide cuáles se muestran (RN-05); la API vuelve a comprobar ambas cosas.
// Si una pendiente choca con una aprobada, se revisa antes de ofrecer «Aprobar reserva» (RN-01, diseño AD09).
// El resultado de cada acción, o su error, sale en un aviso flotante.
export function AccionesDeEstado({ reserva, usuarioActual, alCambiar }) {
  const mostrarAviso = useAviso()
  const [elegida, setElegida] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const presentacion = presentacionDeLaDecision(reserva, usuarioActual)
  const { esAdministrador } = presentacion

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

  return (
    <TarjetaDeDecision
      reserva={reserva}
      presentacion={presentacion}
      situacion={situacion}
      cruce={cruce}
      accion={elegida ? ACCIONES[elegida] : null}
      enviando={enviando}
      alElegir={setElegida}
      alConfirmar={confirmar}
      alCancelar={() => setElegida(null)}
    />
  )
}
