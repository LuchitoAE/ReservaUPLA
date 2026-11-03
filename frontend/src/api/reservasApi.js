import { conFiltros, pedir } from './clienteApi'

// Endpoints de reservas: registrar (RF-03) y consultar la disponibilidad (RF-04).
export function registrarReserva(reserva) {
  return pedir('/reservas', { method: 'POST', body: JSON.stringify(reserva) })
}

export function consultarDisponibilidad({ id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva }) {
  return pedir(conFiltros('/reservas/disponibilidad', { id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva }))
}
