import { describe, expect, it } from 'vitest'
import { APARIENCIA, hayLineaDeTiempo, subtituloDe, textoDeDisponibilidad } from './disponibilidad'

// RF-04 y diseño S04: la tarjeta dice si el horario está libre y qué reservas tiene el día, siempre en el mismo alto.
describe('textoDeDisponibilidad', () => {
  it('en un horario libre con solicitud, nombra el rango elegido', () => {
    expect(
      textoDeDisponibilidad({ estado: 'libre', mensaje: null, solicitud: { inicio: '08:00', fin: '10:00' } }),
    ).toBe('De 08:00 a 10:00 no hay reservas aprobadas en este ambiente.')
  })

  it('prefiere el mensaje de la API cuando lo hay', () => {
    expect(textoDeDisponibilidad({ estado: 'ocupado', mensaje: 'Otra reserva ocupa ese horario.', solicitud: null })).toBe(
      'Otra reserva ocupa ese horario.',
    )
  })

  it('sin mensaje, usa el texto del estado', () => {
    expect(textoDeDisponibilidad({ estado: 'espera', mensaje: null, solicitud: null })).toBe(APARIENCIA.espera.texto)
    expect(textoDeDisponibilidad({ estado: 'ocupado', mensaje: null, solicitud: null })).toBe(APARIENCIA.ocupado.texto)
  })
})

describe('hayLineaDeTiempo', () => {
  it('solo se dibuja con la consulta terminada y algo que mostrar', () => {
    expect(hayLineaDeTiempo({ estado: 'espera', reservasDelDia: [], solicitud: null })).toBe(false)
    expect(hayLineaDeTiempo({ estado: 'consultando', reservasDelDia: [{}], solicitud: null })).toBe(false)
    expect(hayLineaDeTiempo({ estado: 'error', reservasDelDia: [{}], solicitud: null })).toBe(false)
  })

  it('con reservas del día, se dibuja también cuando el horario está ocupado', () => {
    expect(hayLineaDeTiempo({ estado: 'ocupado', reservasDelDia: [{}], solicitud: null })).toBe(true)
    expect(hayLineaDeTiempo({ estado: 'libre', reservasDelDia: [{}], solicitud: null })).toBe(true)
  })

  it('en un día sin reservas, solo aparece si hay una solicitud libre que ubicar', () => {
    expect(hayLineaDeTiempo({ estado: 'libre', reservasDelDia: [], solicitud: { inicio: '08:00', fin: '09:00' } })).toBe(true)
    expect(hayLineaDeTiempo({ estado: 'libre', reservasDelDia: [], solicitud: null })).toBe(false)
  })
})

describe('subtituloDe', () => {
  it('invita a elegir mientras faltan datos', () => {
    expect(subtituloDe(null, null)).toBe('Elija el ambiente, la fecha y las horas.')
    expect(subtituloDe({ nombre_ambiente: 'Laboratorio 1' }, null)).toBe('Laboratorio 1 · elija la fecha.')
  })

  it('junta el ambiente y el día elegido', () => {
    expect(subtituloDe({ nombre_ambiente: 'Laboratorio 1' }, '2026-11-09')).toBe('Laboratorio 1 · lunes 9 de noviembre')
  })
})
