import { Link } from 'react-router'
import { Icono } from './Icono'

// Tarjeta de un indicador (componente «CardIndicador» del caso): nombre, valor y una línea que lo explica. La cifra
// va en color de texto; el ícono, con el color del estado, ayuda a reconocerla pero nunca va solo.
// Con «destino», la tarjeta lleva al listado ya filtrado: del número se pasa a las reservas que lo forman.
const TONOS = {
  neutro: 'bg-info-fondo text-info-texto',
  Pendiente: 'bg-pendiente-fondo text-pendiente-texto',
  Aprobada: 'bg-aprobada-fondo text-aprobada-texto',
  Rechazada: 'bg-rechazada-fondo text-rechazada-texto',
  Cancelada: 'bg-cancelada-fondo text-cancelada-texto',
}

export function CardIndicador({ titulo, valor, descripcion, icono, tono = 'neutro', destino }) {
  const contenido = (
    <>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${TONOS[tono]}`}>
        <Icono nombre={icono} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold text-texto-suave">{titulo}</span>
        <span className="text-3xl font-semibold break-words text-texto">{valor}</span>
        {descripcion && <span className="text-sm text-texto-suave">{descripcion}</span>}
      </span>
    </>
  )

  const clases = 'flex gap-4 rounded-xl border border-borde bg-superficie p-5'

  return destino ? (
    <Link
      to={destino}
      className={`${clases} hover:border-borde-control hover:bg-superficie-tenue focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-foco`}
    >
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  )
}
