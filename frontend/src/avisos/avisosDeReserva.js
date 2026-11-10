import { formatearFechaCorta } from '../utils/fechas'

// El aviso que confirma lo que pasó con una reserva, con el color del semáforo de su estado (RNF-05) y qué reserva
// es: código, ambiente, día y horario (diseño AD08).
const POR_ESTADO = {
  Pendiente: { tipo: 'pendiente', titulo: 'Reserva registrada', cierre: ' Queda pendiente de aprobación.' },
  Aprobada: { tipo: 'aprobada', titulo: 'Reserva aprobada', cierre: '' },
  Rechazada: { tipo: 'rechazada', titulo: 'Reserva rechazada', cierre: '' },
  Cancelada: { tipo: 'cancelada', titulo: 'Reserva cancelada', cierre: '' },
}

export function avisoDeReserva(reserva) {
  const { tipo, titulo, cierre } = POR_ESTADO[reserva.estado_reserva]
  const cuando = `${formatearFechaCorta(reserva.fecha_reserva)} de ${reserva.hora_inicio_reserva} a ${reserva.hora_fin_reserva}`

  return { tipo, titulo, texto: `${reserva.codigo_reserva} · ${reserva.nombre_ambiente}, ${cuando}.${cierre}` }
}
