import { describe, expect, it } from 'vitest'
import { cruceAprobado, situacionDeLaReserva } from './situacionDeLaReserva'

// RNF-05 y diseño AD08/AD09: la tarjeta de la decisión dice en qué está la reserva con el color del semáforo; si una
// pendiente choca con una aprobada, lo dice en ámbar y no deja aprobar (RN-01, RN-08).
describe('situacionDeLaReserva', () => {
  it.each([
    ['Aprobada', 'exito', 'Aprobada'],
    ['Rechazada', 'error', 'Rechazada'],
    ['Cancelada', 'cancelada', 'Cancelada'],
    ['Pendiente', 'aviso', 'Pendiente de aprobación'],
  ])('%s se muestra como «%s» con el título «%s»', (estado, tipo, titulo) => {
    expect(situacionDeLaReserva({ estado_reserva: estado }, { esAdministrador: true })).toMatchObject({ tipo, titulo, sePuedeAprobar: true })
  })

  it('una pendiente que choca con una aprobada se ve en ámbar y no se puede aprobar', () => {
    const situacion = situacionDeLaReserva(
      { estado_reserva: 'Pendiente' },
      { esAdministrador: true, cruce: { codigo_reserva: 'RES-2026-0001', hora_inicio_reserva: '08:00', hora_fin_reserva: '10:00' } },
    )

    expect(situacion).toMatchObject({ tipo: 'aviso', titulo: 'Choca con una reserva aprobada', sePuedeAprobar: false })
    expect(situacion.texto).toBe('RES-2026-0001 ya ocupa de 08:00 a 10:00: no se puede aprobar.')
  })

  it('cada texto es corto: cabe en el alto fijo de la tarjeta (RNF-04)', () => {
    const cruce = { codigo_reserva: 'RES-2026-0001', hora_inicio_reserva: '08:00', hora_fin_reserva: '10:00' }
    for (const estado of ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada']) {
      for (const opciones of [{ esAdministrador: true }, { esAdministrador: false }, { esAdministrador: true, cruce }]) {
        expect(situacionDeLaReserva({ estado_reserva: estado }, opciones).texto.length).toBeLessThanOrEqual(72)
      }
    }
  })

  it('al solicitante le explica quién decide', () => {
    expect(situacionDeLaReserva({ estado_reserva: 'Pendiente' }, { esAdministrador: false }).texto).toMatch(/administrador/)
  })

  it('los estados finales lo dicen', () => {
    expect(situacionDeLaReserva({ estado_reserva: 'Rechazada' }, {}).texto).toMatch(/estado final/i)
    expect(situacionDeLaReserva({ estado_reserva: 'Cancelada' }, {}).texto).toMatch(/estado final/i)
  })
})

describe('cruceAprobado (RN-01)', () => {
  const reserva = { codigo_reserva: 'RES-2026-0002', hora_inicio_reserva: '09:00', hora_fin_reserva: '11:00' }
  const del_dia = (estado, inicio, fin, codigo = 'RES-2026-0001') => ({
    codigo_reserva: codigo, estado_reserva: estado, hora_inicio_reserva: inicio, hora_fin_reserva: fin,
  })

  it('encuentra la aprobada que se cruza con el horario', () => {
    expect(cruceAprobado(reserva, [del_dia('Aprobada', '08:00', '10:00')])).toMatchObject({ codigo_reserva: 'RES-2026-0001' })
  })

  it('ignora las que no están aprobadas, las que solo se tocan y la misma reserva', () => {
    expect(cruceAprobado(reserva, [del_dia('Pendiente', '08:00', '10:00')])).toBeNull()
    expect(cruceAprobado(reserva, [del_dia('Aprobada', '11:00', '12:00')])).toBeNull()
    expect(cruceAprobado(reserva, [del_dia('Aprobada', '09:00', '11:00', 'RES-2026-0002')])).toBeNull()
    expect(cruceAprobado(reserva, [])).toBeNull()
  })
})
