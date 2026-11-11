// Reglas de la línea de tiempo del día en la tarjeta de disponibilidad (diseño S04): horas «HH:mm» a minutos, los
// bloques de las reservas y de la solicitud, y la ventana de horas que se dibuja. La ventana empieza una hora antes
// del primer bloque y termina una hora después del último, dentro del horario del sistema: así se ve el contexto del
// horario elegido sin dibujar las quince horas del día.
export const MINUTOS_POR_HORA = 60
export const ALTO_DE_HORA = 40
export const APERTURA = 7 * MINUTOS_POR_HORA
export const CIERRE = 22 * MINUTOS_POR_HORA

export const DETALLE_POR_ESTADO = {
  Aprobada: 'Ocupado (aprobada)',
  Pendiente: 'Pendiente (por aprobar)',
}

// 'HH:mm' → minutos desde la medianoche, y de vuelta (para ubicar cada bloque en la línea de tiempo).
export function aMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number)
  return horas * MINUTOS_POR_HORA + minutos
}

export function aHora(minutos) {
  const horas = String(Math.floor(minutos / MINUTOS_POR_HORA)).padStart(2, '0')
  const resto = String(minutos % MINUTOS_POR_HORA).padStart(2, '0')
  return `${horas}:${resto}`
}

// Dos horarios se cruzan si cada uno empieza antes de que termine el otro.
function seCruzan(inicio, fin, otroInicio, otroFin) {
  return otroInicio !== null && inicio < otroFin && fin > otroInicio
}

// Cada reserva del día y, cuando el horario está libre, la solicitud encima. «comparteFranja» dice si el bloque se
// cruza con otro: entonces uno ocupa la franja izquierda y el otro la derecha, para que los dos textos se lean.
export function construirBloques({ reservasDelDia = [], solicitud = null, mostrarSolicitud = false }) {
  const solicitudInicio = mostrarSolicitud && solicitud ? aMinutos(solicitud.inicio) : null
  const solicitudFin = mostrarSolicitud && solicitud ? aMinutos(solicitud.fin) : null

  const bloques = reservasDelDia.map((reserva) => {
    const inicio = aMinutos(reserva.hora_inicio_reserva)
    const fin = aMinutos(reserva.hora_fin_reserva)
    return {
      clave: reserva.codigo_reserva,
      esSolicitud: false,
      estado: reserva.estado_reserva,
      inicio,
      fin,
      titulo: `${reserva.hora_inicio_reserva} a ${reserva.hora_fin_reserva} · ${reserva.codigo_reserva}`,
      detalle: DETALLE_POR_ESTADO[reserva.estado_reserva] ?? reserva.estado_reserva,
      comparteFranja: seCruzan(inicio, fin, solicitudInicio, solicitudFin),
    }
  })

  if (mostrarSolicitud && solicitud) {
    // Si la solicitud se cruza con una reserva pendiente (las aprobadas la vuelven «ocupado»), se dibuja en la
    // franja derecha: así los dos textos se leen y se ve el cruce sin tapar el código de la reserva.
    const seCruza = reservasDelDia.some((reserva) =>
      seCruzan(aMinutos(reserva.hora_inicio_reserva), aMinutos(reserva.hora_fin_reserva), solicitudInicio, solicitudFin),
    )
    bloques.push({
      clave: 'solicitud',
      esSolicitud: true,
      estado: 'solicitud',
      inicio: solicitudInicio,
      fin: solicitudFin,
      titulo: `${solicitud.inicio} a ${solicitud.fin}`,
      detalle: 'Su solicitud',
      comparteFranja: seCruza,
    })
  }

  return bloques
}

// Horas visibles y alto de la línea, o null cuando no hay bloques que mostrar.
export function ventanaDeLaLinea(bloques) {
  if (bloques.length === 0) {
    return null
  }

  const desde = Math.max(
    APERTURA,
    Math.floor(Math.min(...bloques.map((bloque) => bloque.inicio)) / MINUTOS_POR_HORA) * MINUTOS_POR_HORA - MINUTOS_POR_HORA,
  )
  const hasta = Math.min(
    CIERRE,
    Math.ceil(Math.max(...bloques.map((bloque) => bloque.fin)) / MINUTOS_POR_HORA) * MINUTOS_POR_HORA + MINUTOS_POR_HORA,
  )

  const horas = []
  for (let minuto = desde; minuto <= hasta; minuto += MINUTOS_POR_HORA) {
    horas.push(minuto)
  }

  return { desde, horas, alto: (horas.length - 1) * ALTO_DE_HORA }
}
