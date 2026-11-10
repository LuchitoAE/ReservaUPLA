import { formatearFechaDelDia } from '../../utils/fechas'
import { AlertMessage } from '../ui/AlertMessage'
import { Icono } from '../ui/Icono'

// La tarjeta de disponibilidad del formulario (diseño S04). Mientras se llena la reserva, al costado del formulario,
// dice si el horario está libre (RF-04) y dibuja el día del ambiente en una línea de tiempo: cada reserva aprobada en
// gris y la solicitud en verde. El solicitante elige otro horario sin adivinar (prevención de errores) y ve el
// resultado de cada cambio al instante (feedback). El mensaje ocupa siempre el mismo alto (RNF-04: 128 px) y lleva el
// semáforo de estados (RNF-05): libre en verde, ocupado en ámbar. La línea de tiempo es adorno para quien ve la
// pantalla: la misma información va en una lista que sí lee el lector de pantalla.
const APARIENCIA = {
  espera: {
    tipo: 'info',
    titulo: 'Elija el ambiente, la fecha y las horas',
    texto: 'Aquí verá si el horario está libre y qué reservas tiene ese día.',
  },
  consultando: { tipo: 'info', titulo: 'Revisando la disponibilidad…', texto: 'Un momento.' },
  libre: { tipo: 'exito', titulo: 'Horario libre.' },
  ocupado: { tipo: 'aviso', titulo: 'Horario ocupado.' },
  error: { tipo: 'error', titulo: 'No se pudo revisar la disponibilidad' },
}

const HORA = 60
const ALTO_DE_HORA = 40
const APERTURA = 7 * HORA
const CIERRE = 22 * HORA

// 'HH:mm' → minutos desde la medianoche, y de vuelta (para ubicar cada bloque en la línea de tiempo).
const aMinutos = (hora) => {
  const [horas, minutos] = hora.split(':').map(Number)
  return horas * HORA + minutos
}

const aHora = (minutos) =>
  `${String(Math.floor(minutos / HORA)).padStart(2, '0')}:${String(minutos % HORA).padStart(2, '0')}`

const DETALLE = {
  Aprobada: 'Ocupado (aprobada)',
  Pendiente: 'Pendiente (por aprobar)',
}

const ESTILO = {
  Aprobada: 'bg-cancelada-fondo text-cancelada-texto',
  Pendiente: 'border border-dashed border-pendiente-texto/60 bg-pendiente-fondo text-pendiente-texto',
  solicitud: 'z-10 border-2 border-dashed border-aprobar bg-aprobada-fondo text-aprobada-texto',
}

// La línea de tiempo: una fila por hora, con las reservas del día y, cuando el horario está libre, la solicitud
// encima. La ventana empieza una hora antes del primer bloque y termina una hora después del último, dentro del
// horario del sistema: así se ve el contexto del horario elegido sin dibujar las quince horas del día.
function LineaDeTiempo({ reservasDelDia, solicitud, mostrarSolicitud }) {
  const solicitudInicio = mostrarSolicitud && solicitud ? aMinutos(solicitud.inicio) : null
  const solicitudFin = mostrarSolicitud && solicitud ? aMinutos(solicitud.fin) : null
  const seCruzan = (inicio, fin) =>
    solicitudInicio !== null && inicio < solicitudFin && fin > solicitudInicio

  const bloques = reservasDelDia.map((reserva) => {
    const inicio = aMinutos(reserva.hora_inicio_reserva)
    const fin = aMinutos(reserva.hora_fin_reserva)
    return {
      clave: reserva.codigo_reserva,
      inicio,
      fin,
      titulo: `${reserva.hora_inicio_reserva} a ${reserva.hora_fin_reserva} · ${reserva.codigo_reserva}`,
      detalle: DETALLE[reserva.estado_reserva] ?? reserva.estado_reserva,
      estilo: ESTILO[reserva.estado_reserva] ?? ESTILO.Aprobada,
      // Si se cruza con la solicitud, la reserva ocupa la franja izquierda para que los dos textos se lean.
      lado: seCruzan(inicio, fin) ? 'left-14 right-[calc(50%+2px)]' : 'left-14 right-1',
    }
  })
  if (mostrarSolicitud && solicitud) {
    // Si la solicitud se cruza con una reserva pendiente (las aprobadas la vuelven «ocupado»), se dibuja en la
    // franja derecha: así los dos textos se leen y se ve el cruce sin tapar el código de la reserva.
    const seCruza = reservasDelDia.some(
      (reserva) => seCruzan(aMinutos(reserva.hora_inicio_reserva), aMinutos(reserva.hora_fin_reserva)),
    )
    bloques.push({
      clave: 'solicitud',
      inicio: solicitudInicio,
      fin: solicitudFin,
      titulo: `${solicitud.inicio} a ${solicitud.fin}`,
      detalle: 'Su solicitud',
      estilo: ESTILO.solicitud,
      lado: seCruza ? 'left-1/2 right-1' : 'left-14 right-1',
    })
  }
  if (bloques.length === 0) {
    return null
  }

  const desde = Math.max(APERTURA, Math.floor(Math.min(...bloques.map((bloque) => bloque.inicio)) / HORA) * HORA - HORA)
  const hasta = Math.min(CIERRE, Math.ceil(Math.max(...bloques.map((bloque) => bloque.fin)) / HORA) * HORA + HORA)
  const horas = []
  for (let minuto = desde; minuto <= hasta; minuto += HORA) {
    horas.push(minuto)
  }
  const alto = (horas.length - 1) * ALTO_DE_HORA

  return (
    <>
      <ul className="sr-only">
        {reservasDelDia.map((reserva) => (
          <li key={reserva.codigo_reserva}>
            De {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}, {reserva.codigo_reserva}:{' '}
            {DETALLE[reserva.estado_reserva] ?? reserva.estado_reserva}.
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
            className={`absolute overflow-hidden rounded-lg px-2 py-1 ${bloque.lado} ${bloque.estilo}`}
            style={{
              top: ((bloque.inicio - desde) / HORA) * ALTO_DE_HORA,
              height: ((bloque.fin - bloque.inicio) / HORA) * ALTO_DE_HORA,
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

// «ambiente · lunes 9 de noviembre», como en el diseño; mientras faltan datos, invita a elegirlos.
function subtituloDe(ambiente, fecha) {
  if (!ambiente) {
    return 'Elija el ambiente, la fecha y las horas.'
  }
  if (!fecha) {
    return `${ambiente.nombre_ambiente} · elija la fecha.`
  }
  return `${ambiente.nombre_ambiente} · ${formatearFechaDelDia(fecha)}`
}

export function PanelDisponibilidad({ disponibilidad, ambiente, fecha, solicitud }) {
  const { estado, mensaje, reservasDelDia } = disponibilidad
  const apariencia = APARIENCIA[estado]
  const texto =
    estado === 'libre' && solicitud
      ? `De ${solicitud.inicio} a ${solicitud.fin} no hay reservas aprobadas en este ambiente.`
      : (mensaje ?? apariencia.texto)
  const hayLinea =
    (estado === 'libre' || estado === 'ocupado') && (reservasDelDia.length > 0 || (estado === 'libre' && solicitud))

  return (
    <section
      aria-labelledby="titulo-disponibilidad"
      className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-5"
    >
      <div className="flex items-start gap-3">
        <Icono nombre="pendiente" className="mt-0.5 size-6 text-info" />
        <div className="min-w-0">
          <h3 id="titulo-disponibilidad" className="text-lg font-semibold text-titulo">
            Disponibilidad
          </h3>
          <p className="text-sm text-texto-suave">{subtituloDe(ambiente, fecha)}</p>
        </div>
      </div>

      <div aria-live="polite">
        <AlertMessage
          tipo={apariencia.tipo}
          titulo={apariencia.titulo}
          anunciar={false}
          className={`min-h-32 ${estado === 'error' ? 'break-words' : ''}`}
        >
          {texto}
        </AlertMessage>
      </div>

      {hayLinea && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-texto-suave uppercase">
            Ese día, este ambiente tiene:
          </p>
          <LineaDeTiempo
            reservasDelDia={reservasDelDia}
            solicitud={solicitud}
            mostrarSolicitud={estado === 'libre'}
          />
        </div>
      )}

      <p className="text-sm text-texto-suave">
        Solo bloquean el horario las reservas aprobadas. Si otra persona pidió la misma hora, el administrador decide.
      </p>
    </section>
  )
}
