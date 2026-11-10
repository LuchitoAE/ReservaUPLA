import { useState } from 'react'
import { cambiarEstadoDeReserva } from '../../api/reservasApi'
import { useAviso } from '../../hooks/useAviso'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { avisoDeError } from '../../utils/avisoDeError'
import { AlertMessage } from '../ui/AlertMessage'
import { Button } from '../ui/Button'
import { Icono } from '../ui/Icono'
import { ModalConfirmacion } from '../ui/ModalConfirmacion'
import { cruceAprobado, situacionDeLaReserva } from './situacionDeLaReserva'

// Cómo se presenta cada acción: el botón de la tarjeta, el de la confirmación, lo que pasa después y el verbo para el
// error. En la tarjeta, aprobar va relleno en verde, rechazar y cancelar con borde rojo, y cancelar una pendiente del
// administrador como enlace azul (diseños AD06, AD08, AD09, S11 y S14).
const ACCIONES = {
  Aprobada: {
    boton: 'Aprobar reserva',
    verbo: 'aprobar',
    variante: 'aprobar',
    confirmacion: 'aprobar',
    icono: 'aprobada',
    pregunta: '¿Aprobar la reserva?',
    efecto: 'El ambiente quedará ocupado en ese horario y nadie más podrá reservarlo.',
  },
  Rechazada: {
    boton: 'Rechazar reserva',
    verbo: 'rechazar',
    variante: 'peligro-borde',
    confirmacion: 'peligro',
    icono: 'rechazada',
    pregunta: '¿Rechazar la reserva?',
    efecto: 'Una reserva rechazada ya no puede modificarse.',
  },
  Cancelada: {
    boton: 'Cancelar reserva',
    verbo: 'cancelar',
    variante: 'peligro-borde',
    confirmacion: 'peligro',
    icono: 'cancelada',
    pregunta: '¿Cancelar la reserva?',
    efecto: 'El horario quedará libre y la reserva ya no podrá reactivarse.',
  },
}

const FINALES = ['Rechazada', 'Cancelada']

// RF-07: en qué está la reserva y lo que el usuario actual puede hacer con ella. El estado actual dice a cuáles puede
// pasar (lo envía la API) y el rol decide cuáles se muestran (RN-05); la API vuelve a comprobar ambas cosas.
// La situación va en un mensaje de alto fijo (RNF-04: la tarjeta no cambia de tamaño) con el color del semáforo; si
// una pendiente choca con una aprobada, se ve en ámbar y «Aprobar reserva» queda deshabilitado (RN-01, diseño AD09).
// El resultado de cada acción, o su error, sale en un aviso flotante.
export function AccionesDeEstado({ reserva, usuarioActual, alCambiar }) {
  const mostrarAviso = useAviso()
  const [elegida, setElegida] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const esAdministrador = usuarioActual?.rol_usuario === 'Administrador'
  const esResponsable = usuarioActual?.rol_usuario === 'ResponsableDeAmbiente'
  const esSolicitante = usuarioActual?.id_usuario === reserva.id_usuario
  const esFinal = FINALES.includes(reserva.estado_reserva)
  const permitidas = reserva.estados_siguientes_reserva.filter((estado) =>
    estado === 'Cancelada' ? esAdministrador || esSolicitante : esAdministrador,
  )

  // Solo el administrador decide una pendiente: para él se revisa si el horario ya lo ocupa otra aprobada.
  const revisarCruce = esAdministrador && reserva.estado_reserva === 'Pendiente'
  const disponibilidad = useDisponibilidad(reserva, revisarCruce)
  const cruce = revisarCruce ? cruceAprobado(reserva, disponibilidad.reservasDelDia) : null
  const situacion = situacionDeLaReserva(reserva, { esAdministrador, cruce })

  // El título y el ícono dicen desde qué lugar se mira la reserva (AD06, S11, S13, S14 y R04).
  const titulo = esAdministrador ? 'Decisión' : esResponsable ? 'Uso de su ambiente' : esFinal ? 'Estado final' : 'Acciones'
  const icono = esResponsable ? 'ambientes' : esFinal ? 'cancelada' : 'aprobada'
  // El administrador ve siempre la situación; el solicitante, cuando ya no está pendiente (S11 no la lleva).
  const verSituacion = esAdministrador || (esSolicitante && reserva.estado_reserva !== 'Pendiente')

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
  const soloCancelar = permitidas.length === 1 && permitidas[0] === 'Cancelada'

  // Cuando el administrador puede aprobar o rechazar, cancelar queda al pie como enlace (AD06). Si es la única acción,
  // va como botón de borde rojo (AD08).
  const comoEnlace = (estado) => estado === 'Cancelada' && esAdministrador && !esFinal && permitidas.length > 1

  return (
    <section aria-labelledby="titulo-acciones" className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta">
      <div className="flex items-start gap-2.5">
        <Icono nombre={icono} className="mt-0.5 size-5 text-foco" />
        <div>
          <h2 id="titulo-acciones" className="text-lg font-semibold text-titulo">
            {titulo}
          </h2>
          {esAdministrador && <p className="text-sm text-texto-suave">Solo el administrador ve esta tarjeta</p>}
        </div>
      </div>

      {esResponsable ? (
        <>
          <AlertMessage tipo="info" anunciar={false}>
            <p className="font-semibold">Usted es responsable del {reserva.nombre_ambiente}.</p>
            <p className="mt-1 text-sm">Puede consultar sus reservas. Solo un administrador puede aprobar o rechazar.</p>
          </AlertMessage>
          <Button destino="/">
            <Icono nombre="reservas" />
            Ver la agenda del ambiente
          </Button>
        </>
      ) : (
        <>
          {verSituacion && (
            <AlertMessage tipo={situacion.tipo} titulo={situacion.titulo} anunciar={false} className="min-h-28">
              <p id="situacion-reserva" className="text-sm">
                {situacion.texto}
              </p>
            </AlertMessage>
          )}

          {permitidas.length > 0 && (
            <div className="flex flex-col gap-2">
              {permitidas.map((estado, indice) => {
                const bloqueado = estado === 'Aprobada' && !situacion.sePuedeAprobar
                const enlace = comoEnlace(estado)
                return (
                  <div key={estado} className="flex flex-col gap-2">
                    {enlace && indice > 0 && <hr className="my-1 border-borde" />}
                    <Button
                      variante={enlace ? 'enlace' : ACCIONES[estado].variante}
                      disabled={bloqueado}
                      aria-describedby={bloqueado ? 'situacion-reserva' : undefined}
                      onClick={() => setElegida(estado)}
                    >
                      <Icono nombre={ACCIONES[estado].icono} />
                      {ACCIONES[estado].boton}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {esFinal && esSolicitante && (
            <Button destino="/reservas/nueva" variante="acento">
              <Icono nombre="nueva" />
              Nueva reserva
            </Button>
          )}

          {esAdministrador && !esFinal && !soloCancelar && permitidas.length > 0 && !cruce && (
            <p className="text-sm text-texto-suave">
              Aprobar, rechazar y cancelar piden confirmación. El solicitante verá el nuevo estado en su panel.
            </p>
          )}
          {soloCancelar && esAdministrador && (
            <p className="text-sm text-texto-suave">Si se cancela, el horario queda libre y la reserva ya no puede reactivarse.</p>
          )}
          {soloCancelar && !esAdministrador && !esFinal && (
            <p className="text-sm text-texto-suave">Solo un administrador puede aprobar o rechazar; cancelar, quien la solicitó.</p>
          )}
        </>
      )}

      <ModalConfirmacion
        abierto={Boolean(accion)}
        titulo={accion?.pregunta}
        textoConfirmar={accion?.boton}
        variante={accion?.confirmacion}
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
