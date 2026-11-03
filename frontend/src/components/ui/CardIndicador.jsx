import { Link } from 'react-router'
import { Icono } from './Icono'

// Tarjeta de un indicador (componente «CardIndicador» del caso): nombre, valor y una línea que lo explica. La cifra
// va en color de texto; el ícono, con el color del estado, ayuda a reconocerla pero nunca va solo.
// Con «destino», la tarjeta lleva al listado ya filtrado, y lo dice: «Ver reservas →» es el significante (Norman) que
// la distingue de una tarjeta solo informativa; además cambia al pasar el puntero y al pulsarla (feedback).
const TONOS = {
  neutro: 'bg-info-fondo text-info-texto',
  Pendiente: 'bg-pendiente-fondo text-pendiente-texto',
  Aprobada: 'bg-aprobada-fondo text-aprobada-texto',
  Rechazada: 'bg-rechazada-fondo text-rechazada-texto',
  Cancelada: 'bg-cancelada-fondo text-cancelada-texto',
}

export function CardIndicador({ titulo, valor, descripcion, icono, tono = 'neutro', destino, accion = 'Ver reservas' }) {
  const contenido = (
    <>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${TONOS[tono]}`}>
        <Icono nombre={icono} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold text-texto-suave">{titulo}</span>
        <span className="text-3xl font-semibold break-words text-texto">{valor}</span>
        {descripcion && <span className="text-sm text-texto-suave">{descripcion}</span>}
        {destino && (
          <span className="mt-2 text-sm font-semibold text-enlace underline-offset-2 group-hover:underline">
            {accion} <span aria-hidden="true">→</span>
          </span>
        )}
      </span>
    </>
  )

  const clases = 'flex gap-4 rounded-xl border border-borde bg-superficie p-5'

  return destino ? (
    <Link
      to={destino}
      className={`group ${clases} transition hover:border-borde-control hover:shadow-md active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-foco`}
    >
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  )
}
