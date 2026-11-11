import { describe, expect, it } from 'vitest'
import { resumenDelPanel } from './resumenDelPanel'

// RF-12 y diseños S01, R01 y AD01: el panel saluda por el nombre y dice en una frase lo que le importa a cada rol.
describe('resumenDelPanel', () => {
  it('al solicitante, cuántas reservas suyas esperan aprobación', () => {
    const nombre = 'Luis Aquino Espinoza'
    expect(resumenDelPanel({ rol: 'Solicitante', nombre, pendientes: 1 })).toBe('Hola, Luis. Tiene 1 reserva esperando la aprobación del administrador.')
    expect(resumenDelPanel({ rol: 'Solicitante', nombre, pendientes: 3 })).toBe('Hola, Luis. Tiene 3 reservas esperando la aprobación del administrador.')
    expect(resumenDelPanel({ rol: 'Solicitante', nombre, pendientes: 0 })).toBe('Hola, Luis. No tiene reservas esperando aprobación.')
  })

  it('al responsable, las aprobadas y las pendientes de esta semana en sus ambientes', () => {
    const nombre = 'Pedro Huamán'
    expect(resumenDelPanel({ rol: 'ResponsableDeAmbiente', nombre, semana: { aprobadas: 2, pendientes: 1 } })).toBe(
      'Hola, Pedro. Esta semana, en sus ambientes: 2 reservas aprobadas y 1 pendiente.',
    )
    expect(resumenDelPanel({ rol: 'ResponsableDeAmbiente', nombre, semana: { aprobadas: 1, pendientes: 2 } })).toBe(
      'Hola, Pedro. Esta semana, en sus ambientes: 1 reserva aprobada y 2 pendientes.',
    )
    expect(resumenDelPanel({ rol: 'ResponsableDeAmbiente', nombre, semana: { aprobadas: 0, pendientes: 0 } })).toBe(
      'Hola, Pedro. Esta semana no hay reservas en sus ambientes.',
    )
  })

  it('al administrador, cuántas esperan su aprobación', () => {
    const nombre = 'Rosa Mendoza'
    expect(resumenDelPanel({ rol: 'Administrador', nombre, pendientes: 2 })).toBe('Hola, Rosa. Hay 2 reservas que esperan su aprobación.')
    expect(resumenDelPanel({ rol: 'Administrador', nombre, pendientes: 1 })).toBe('Hola, Rosa. Hay 1 reserva que espera su aprobación.')
    expect(resumenDelPanel({ rol: 'Administrador', nombre, pendientes: 0 })).toBe('Hola, Rosa. No hay reservas esperando su aprobación.')
  })

  it('mientras los datos cargan, solo saluda', () => {
    expect(resumenDelPanel({ rol: 'Administrador', nombre: 'Rosa Mendoza' })).toBe('Hola, Rosa.')
  })
})
