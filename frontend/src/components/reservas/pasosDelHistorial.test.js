import { describe, expect, it } from 'vitest'
import { pasosDelHistorial } from './pasosDelHistorial'

const REGISTRO = { estado_historial: 'Pendiente', fecha_historial: '2026-11-03T15:00:00Z', id_usuario: 'u1', nombre_completo_usuario: 'Luis Aquino Espinoza' }
const APROBACION = { estado_historial: 'Aprobada', fecha_historial: '2026-11-04T14:30:00Z', id_usuario: 'u2', nombre_completo_usuario: 'Rosa Mendoza Paucar' }

// RF-06 y diseño AD08: el registro se ve como «Registrada» (con quién la pidió) y «Pendiente de aprobación»; cada
// cambio, con quién lo hizo; el último paso es el estado actual.
describe('pasosDelHistorial', () => {
  it('una reserva recién registrada muestra «Registrada» y «Pendiente de aprobación», que es el estado actual', () => {
    const pasos = pasosDelHistorial([REGISTRO])

    expect(pasos.map((paso) => paso.titulo)).toEqual(['Registrada', 'Pendiente de aprobación'])
    expect(pasos[0]).toMatchObject({ estado: 'Registrada', quien: 'Luis Aquino Espinoza', actual: false })
    expect(pasos[1]).toMatchObject({ estado: 'Pendiente', quien: null, actual: true })
  })

  it('cada cambio suma un paso con quién lo hizo, y solo el último es el actual', () => {
    const pasos = pasosDelHistorial([REGISTRO, APROBACION])

    expect(pasos.map((paso) => paso.titulo)).toEqual(['Registrada', 'Pendiente de aprobación', 'Aprobada'])
    expect(pasos.at(-1)).toMatchObject({ estado: 'Aprobada', quien: 'Rosa Mendoza Paucar', fecha: APROBACION.fecha_historial, actual: true })
    expect(pasos.filter((paso) => paso.actual)).toHaveLength(1)
  })

  it('un cambio anterior al historial se marca sin autor, sin inventar quién lo hizo', () => {
    const pasos = pasosDelHistorial([REGISTRO, { ...APROBACION, id_usuario: null, nombre_completo_usuario: null }])

    expect(pasos.at(-1)).toMatchObject({ quien: null, sinAutor: true })
    expect(pasos[0].sinAutor).toBe(false)
  })

  it('sin historial no hay pasos', () => {
    expect(pasosDelHistorial([])).toEqual([])
    expect(pasosDelHistorial(undefined)).toEqual([])
  })

  it('las claves no se repiten', () => {
    const claves = pasosDelHistorial([REGISTRO, APROBACION, { ...APROBACION, estado_historial: 'Cancelada' }]).map((paso) => paso.clave)

    expect(new Set(claves).size).toBe(claves.length)
  })
})
