import { AlertMessage } from '../ui/AlertMessage'
import { Button } from '../ui/Button'
import { Icono } from '../ui/Icono'
import { ModalConfirmacion } from '../ui/ModalConfirmacion'
import { ACCIONES, esAccionComoEnlace } from './configuracionDeAcciones'

// Tarjeta de la decisión (diseños AD06, AD08, AD09, S11, S13 y S14): en qué está la reserva, lo que el usuario actual
// puede hacer y la confirmación antes de cambiar el estado. La situación va en un mensaje de alto fijo (RNF-04: la
// tarjeta no cambia de tamaño) con el color del semáforo y, si una pendiente choca con una aprobada, «Aprobar reserva»
// queda deshabilitado (RN-01, diseño AD09).
export function TarjetaDeDecision({
  reserva,
  presentacion,
  situacion,
  cruce,
  accion,
  enviando,
  alElegir,
  alConfirmar,
  alCancelar,
}) {
  const { titulo, icono, esAdministrador, esResponsable, esSolicitante, esFinal, permitidas, verSituacion, soloCancelar } =
    presentacion
  const comoEnlace = (estado) => esAccionComoEnlace(estado, { esAdministrador, esFinal, permitidas })

  return (
    <section
      aria-labelledby="titulo-acciones"
      className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta"
    >
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
                      onClick={() => alElegir(estado)}
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
        alConfirmar={alConfirmar}
        alCancelar={alCancelar}
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
