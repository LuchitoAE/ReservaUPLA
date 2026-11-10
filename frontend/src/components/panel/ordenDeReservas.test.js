import { describe, expect, it } from 'vitest'
import { proximasPrimero } from './ordenDeReservas'

const r = (codigo, fecha, inicio, estado = 'Aprobada', fin = '23:00') => ({ codigo_reserva: codigo, fecha_reserva: fecha, hora_inicio_reserva: inicio, hora_fin_reserva: fin, estado_reserva: estado })

// «Mis próximas reservas» y «Pendientes por aprobar» (S01, AD01): primero las más próximas, solo las que siguen en pie.
describe('proximasPrimero', () => {
  it('ordena por fecha y, dentro del día, por hora', () => {
    const reservas = [r('C', '2026-11-12', '08:00'), r('B', '2026-11-10', '15:00'), r('A', '2026-11-10', '09:00')]

    expect(proximasPrimero(reservas).map((x) => x.codigo_reserva)).toEqual(['A', 'B', 'C'])
  })

  it('deja fuera las rechazadas y las canceladas, y se queda con las primeras', () => {
    const reservas = [r('R', '2026-11-10', '08:00', 'Rechazada'), r('X', '2026-11-10', '09:00', 'Cancelada'), r('P', '2026-11-11', '08:00', 'Pendiente'),
      r('A1', '2026-11-12', '08:00'), r('A2', '2026-11-13', '08:00')]

    expect(proximasPrimero(reservas, 2).map((x) => x.codigo_reserva)).toEqual(['P', 'A1'])
  })

  it('no cambia la lista que recibe', () => {
    const reservas = [r('B', '2026-11-12', '08:00'), r('A', '2026-11-10', '08:00')]
    proximasPrimero(reservas)

    expect(reservas.map((x) => x.codigo_reserva)).toEqual(['B', 'A'])
  })

  it('deja fuera las de hoy que ya terminaron', () => {
    const reservas = [r('Terminó', '2026-11-09', '08:00', 'Aprobada', '10:00'), r('Más tarde', '2026-11-09', '18:00', 'Aprobada', '20:00'), r('Mañana', '2026-11-10', '08:00')]

    expect(proximasPrimero(reservas, 5, { fecha: '2026-11-09', hora: '15:30' }).map((x) => x.codigo_reserva)).toEqual(['Más tarde', 'Mañana'])
  })
})
