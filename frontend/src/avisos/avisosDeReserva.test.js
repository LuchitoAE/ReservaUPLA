import { describe, expect, it } from 'vitest'
import { avisoDeReserva } from './avisosDeReserva'

const RESERVA = {
  codigo_reserva: 'RES-2026-0005',
  nombre_ambiente: 'Laboratorio de cómputo 1',
  fecha_reserva: '2026-11-11',
  hora_inicio_reserva: '14:00',
  hora_fin_reserva: '16:00',
}

// RNF-05: el aviso de cada estado lleva el color del semáforo (aprobada en verde, pendiente en ámbar, rechazada en
// rojo, cancelada en gris) y dice qué reserva es (diseño AD08).
describe('avisoDeReserva', () => {
  it.each([
    ['Aprobada', 'aprobada', 'Reserva aprobada'],
    ['Rechazada', 'rechazada', 'Reserva rechazada'],
    ['Cancelada', 'cancelada', 'Reserva cancelada'],
    ['Pendiente', 'pendiente', 'Reserva registrada'],
  ])('%s: tipo «%s» y título «%s»', (estado, tipo, titulo) => {
    expect(avisoDeReserva({ ...RESERVA, estado_reserva: estado })).toMatchObject({ tipo, titulo })
  })

  it('dice el código, el ambiente, el día y el horario', () => {
    const { texto } = avisoDeReserva({ ...RESERVA, estado_reserva: 'Aprobada' })

    expect(texto).toBe('RES-2026-0005 · Laboratorio de cómputo 1, miércoles 11/11 de 14:00 a 16:00.')
  })

  it('al registrarla, recuerda que queda pendiente de aprobación', () => {
    expect(avisoDeReserva({ ...RESERVA, estado_reserva: 'Pendiente' }).texto).toMatch(/Queda pendiente de aprobación\.$/)
  })
})
