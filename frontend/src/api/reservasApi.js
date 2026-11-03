import { conFiltros, pedir } from './clienteApi'

// Endpoints de reservas: registrar (RF-03), disponibilidad (RF-04), listar (RF-05) y detalle (RF-06).
export function registrarReserva(reserva) {
  return pedir('/reservas', { method: 'POST', body: JSON.stringify(reserva) })
}

export function consultarDisponibilidad({ id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva }) {
  return pedir(conFiltros('/reservas/disponibilidad', { id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva }))
}

// filtros: { estado_reserva, id_ambiente, fecha_reserva, id_usuario, id_responsable_ambiente }
export function listarReservas(filtros = {}) {
  return pedir(conFiltros('/reservas', filtros))
}

export function obtenerReserva(idReserva) {
  return pedir(`/reservas/${idReserva}`)
}
