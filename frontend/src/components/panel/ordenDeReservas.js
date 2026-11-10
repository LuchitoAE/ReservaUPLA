// Las reservas que siguen en pie (aprobadas o pendientes) y que todavía no terminaron, de la más próxima a la más
// lejana: por fecha y, dentro del día, por hora de inicio. «cantidad»: cuántas mostrar (el panel muestra las primeras).
// «ahora»: { fecha, hora } en Perú; sin él no se descarta ninguna por la hora. No cambia la lista recibida.
export function proximasPrimero(reservas, cantidad = Infinity, ahora = null) {
  const momentoActual = ahora ? `${ahora.fecha} ${ahora.hora}` : null
  return reservas
    .filter((reserva) => reserva.estado_reserva === 'Aprobada' || reserva.estado_reserva === 'Pendiente')
    .filter((reserva) => !momentoActual || `${reserva.fecha_reserva} ${reserva.hora_fin_reserva}` > momentoActual)
    .sort((a, b) => `${a.fecha_reserva} ${a.hora_inicio_reserva}`.localeCompare(`${b.fecha_reserva} ${b.hora_inicio_reserva}`))
    .slice(0, cantidad)
}
