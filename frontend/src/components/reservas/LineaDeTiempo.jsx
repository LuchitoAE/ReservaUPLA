import { ALTO_DE_HORA, MINUTOS_POR_HORA, aHora, construirBloques, ventanaDeLaLinea, DETALLE_POR_ESTADO } from './lineaDeTiempo'

// Apariencia de cada bloque: la reserva aprobada en gris, la pendiente con borde punteado y la solicitud en verde.
const ESTILO = {
  Aprobada: 'bg-cancelada-fondo text-cancelada-texto',
  Pendiente: 'border border-dashed border-pendiente-texto/60 bg-pendiente-fondo text-pendiente-texto',
  solicitud: 'z-10 border-2 border-dashed border-aprobar bg-aprobada-fondo text-aprobada-texto',
}

// Lado que ocupa el bloque cuando se cruza con otro: la reserva a la izquierda y la solicitud a la derecha.
function claseDeLado({ esSolicitud, comparteFranja }) {
  if (esSolicitud) {
    return comparteFranja ? 'left-1/2 right-1' : 'left-14 right-1'
  }
  return comparteFranja ? 'left-14 right-[calc(50%+2px)]' : 'left-14 right-1'
}

// La línea de tiempo del día, con una fila por hora, las reservas y, cuando el horario está libre, la solicitud.
// Es adorno para quien ve la pantalla: la misma información va en una lista que sí lee el lector de pantalla.
export function LineaDeTiempo({ reservasDelDia, solicitud, mostrarSolicitud }) {
  const bloques = construirBloques({ reservasDelDia, solicitud, mostrarSolicitud })
  const ventana = ventanaDeLaLinea(bloques)

  if (!ventana) {
    return null
  }

  const { desde, horas, alto } = ventana

  return (
    <>
      <ul className="sr-only">
        {reservasDelDia.map((reserva) => (
          <li key={reserva.codigo_reserva}>
            De {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}, {reserva.codigo_reserva}:{' '}
            {DETALLE_POR_ESTADO[reserva.estado_reserva] ?? reserva.estado_reserva}.
          </li>
        ))}
        {mostrarSolicitud && solicitud && (
          <li>
            Su solicitud, de {solicitud.inicio} a {solicitud.fin}.
          </li>
        )}
      </ul>

      <div aria-hidden="true" className="relative" style={{ height: alto }}>
        {horas.map((minuto, indice) => (
          <span
            key={`etiqueta-${minuto}`}
            className="absolute left-0 -translate-y-1/2 text-xs text-texto-suave tabular-nums"
            style={{ top: indice * ALTO_DE_HORA }}
          >
            {aHora(minuto)}
          </span>
        ))}
        {horas.map((minuto, indice) => (
          <span
            key={`linea-${minuto}`}
            className="absolute right-0 left-12 border-t border-borde"
            style={{ top: indice * ALTO_DE_HORA }}
          />
        ))}
        {bloques.map((bloque) => (
          <div
            key={bloque.clave}
            className={`absolute overflow-hidden rounded-lg px-2 py-1 ${claseDeLado(bloque)} ${ESTILO[bloque.estado] ?? ESTILO.Aprobada}`}
            style={{
              top: ((bloque.inicio - desde) / MINUTOS_POR_HORA) * ALTO_DE_HORA,
              height: ((bloque.fin - bloque.inicio) / MINUTOS_POR_HORA) * ALTO_DE_HORA,
            }}
          >
            <p className="text-xs leading-tight font-semibold">{bloque.titulo}</p>
            <p className="text-xs leading-tight">{bloque.detalle}</p>
          </div>
        ))}
      </div>
    </>
  )
}
