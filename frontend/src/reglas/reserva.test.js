import { describe, expect, it } from 'vitest'
import { reglasDeReserva } from './reserva'

const VALIDA = { id_ambiente: 'a1', fecha_reserva: '2099-11-18', hora_inicio_reserva: '14:00', hora_fin_reserva: '16:00', motivo_reserva: 'Sesión de práctica del curso.' }
const error = (campo, cambios) => reglasDeReserva.validarCampo(campo, { ...VALIDA, ...cambios })

// RNF-04 y diseño S05: cada error cabe en la línea que el campo reserva bajo él, también en los tres campos angostos
// de «¿Cuándo?». Las reglas son las del dominio (RN-03, RN-04).
describe('mensajes de la reserva en una línea', () => {
  it('la fecha no puede ser anterior a hoy', () => {
    expect(error('fecha_reserva', { fecha_reserva: '2020-01-01' })).toBe('No puede ser anterior a hoy.')
  })

  it('la hora de inicio va entre las 07:00 y las 22:00 (RN-04)', () => {
    expect(error('hora_inicio_reserva', { hora_inicio_reserva: '06:30' })).toBe('Entre 07:00 y 22:00.')
  })

  it('la hora de fin es mayor que la de inicio (RN-03) y no pasa de las 22:00', () => {
    expect(error('hora_fin_reserva', { hora_fin_reserva: '13:00' })).toBe('Mayor que la hora de inicio.')
    expect(error('hora_fin_reserva', { hora_fin_reserva: '22:30' })).toBe('Hasta las 22:00.')
  })

  it('sin errores cuando todo está bien', () => {
    expect(reglasDeReserva.validarTodo(VALIDA)).toEqual({})
  })

  it('ningún mensaje de la fecha o las horas pasa de 32 caracteres', () => {
    const mensajes = [
      error('fecha_reserva', { fecha_reserva: '2020-01-01' }),
      error('fecha_reserva', { fecha_reserva: '' }),
      error('hora_inicio_reserva', { hora_inicio_reserva: '06:30' }),
      error('hora_inicio_reserva', { hora_inicio_reserva: '' }),
      error('hora_fin_reserva', { hora_fin_reserva: '13:00' }),
      error('hora_fin_reserva', { hora_fin_reserva: '' }),
    ]
    for (const mensaje of mensajes) {
      expect(mensaje.length).toBeLessThanOrEqual(32)
    }
  })
})
