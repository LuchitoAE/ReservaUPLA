import { Link } from 'react-router'
import { Icono } from './Icono'

// Tarjeta de un indicador (componente «CardIndicador» del caso, diseño AD01): un ícono con el color del estado, la
// cifra grande y, debajo, cómo se llama. La sexta tarjeta («Ambiente más utilizado», «El que más usa», «A su cargo»)
// no es una cifra: lleva su nombre arriba, el dato en grande y una línea que lo explica.
// Las tarjetas con «destino» llevan al listado ya filtrado; se reconoce al pasar el puntero y al pulsarlas (feedback).
const TONOS = {
  neutro: 'bg-marca-700 text-white',
  info: 'bg-info-fondo text-info-texto',
  Pendiente: 'bg-aviso text-white',
  Aprobada: 'bg-aprobar text-white',
  Rechazada: 'bg-peligro text-white',
  Cancelada: 'bg-cancelada-solida text-white',
  estrella: 'bg-acento text-acento-texto',
}

const MARCO = 'flex min-h-32 flex-col rounded-xl border border-borde bg-superficie p-4'
const INTERACCION =
  'transition hover:border-borde-control hover:shadow-md active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-foco'

export function CardIndicador({ titulo, valor, detalle, icono, tono = 'neutro', variante = 'numero', destino }) {
  const contenido = (
    <>
      {variante === 'texto' ? (
        <>
          <span className="flex items-start gap-2.5">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${TONOS[tono]}`}>
              <Icono nombre={icono} />
            </span>
            <span className="pt-0.5 text-xs leading-snug text-texto-suave">{titulo}</span>
          </span>
          <span className="mt-2.5 block text-base leading-snug font-bold break-words text-texto">{valor}</span>
          {detalle && <span className="mt-auto block pt-2 text-sm text-texto-suave">{detalle}</span>}
        </>
      ) : (
        <>
          <span className="flex items-center gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${TONOS[tono]}`}>
              <Icono nombre={icono} />
            </span>
            <span className="text-3xl font-bold text-texto tabular-nums">{valor}</span>
          </span>
          <span className="mt-auto block pt-3 text-sm text-texto-suave">{titulo}</span>
        </>
      )}
    </>
  )

  return destino ? (
    <Link to={destino} className={`${MARCO} ${INTERACCION}`}>
      {contenido}
    </Link>
  ) : (
    <div className={MARCO}>{contenido}</div>
  )
}
