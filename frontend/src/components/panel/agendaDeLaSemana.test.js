import { describe, expect, it } from 'vitest'
import {
  HORAS_DE_LA_AGENDA,
  bloquesDeLaAgenda,
  diasDeLaSemana,
  lunesDe,
  moverSemana,
  nombreDelDia,
  tituloDeLaSemana,
} from './agendaDeLaSemana'

// RF-13 y diseño R01: la agenda de la semana de cada ambiente a cargo, de lunes a domingo (el sistema acepta reservas
// cualquier día), con las aprobadas y las pendientes entre las 07:00 y las 22:00 (RN-04).
describe('semanas', () => {
  it('el lunes de la semana de cualquier día, también del domingo', () => {
    expect(lunesDe('2026-11-11')).toBe('2026-11-09')
    expect(lunesDe('2026-11-09')).toBe('2026-11-09')
    expect(lunesDe('2026-11-15')).toBe('2026-11-09')
  })

  it('los siete días, aunque cambie de mes o de año', () => {
    expect(diasDeLaSemana('2026-11-30')).toEqual(['2026-11-30', '2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04', '2026-12-05', '2026-12-06'])
    expect(diasDeLaSemana('2026-12-28').at(-1)).toBe('2027-01-03')
  })

  it('pasa a la semana siguiente o a la anterior', () => {
    expect(moverSemana('2026-11-09', 1)).toBe('2026-11-16')
    expect(moverSemana('2026-11-02', -1)).toBe('2026-10-26')
  })

  it('el título dice del lunes al domingo, con el mes y el año solo cuando cambian', () => {
    expect(tituloDeLaSemana('2026-11-09')).toBe('Semana del 9 al 15 de noviembre')
    expect(tituloDeLaSemana('2026-11-30')).toBe('Semana del 30 de noviembre al 6 de diciembre')
    expect(tituloDeLaSemana('2026-12-28')).toBe('Semana del 28 de diciembre de 2026 al 3 de enero de 2027')
  })
})

describe('horas y nombres de la agenda', () => {
  it('marca las horas de la apertura al cierre', () => {
    expect(HORAS_DE_LA_AGENDA).toHaveLength(15)
    expect(HORAS_DE_LA_AGENDA[0]).toBe('07:00')
    expect(HORAS_DE_LA_AGENDA.at(-1)).toBe('21:00')
  })

  it('nombra el día como en la cuadrícula y en la lista', () => {
    expect(nombreDelDia('2026-11-09', { weekday: 'short' })).toBe('lun')
    expect(nombreDelDia('2026-11-09', { weekday: 'long', day: 'numeric' })).toBe('lunes 9')
  })
})

describe('bloquesDeLaAgenda', () => {
  const reserva = (codigo, fecha, inicio, fin, estado = 'Aprobada') => ({
    codigo_reserva: codigo, fecha_reserva: fecha, hora_inicio_reserva: inicio, hora_fin_reserva: fin, estado_reserva: estado,
  })

  it('ubica cada reserva en su día y su horario, como parte de las 15 horas entre las 07:00 y las 22:00', () => {
    const [bloque] = bloquesDeLaAgenda([reserva('RES-2026-0001', '2026-11-11', '08:00', '10:00')], '2026-11-09')

    expect(bloque).toMatchObject({ dia: 2, arriba: (60 / 900) * 100, alto: (120 / 900) * 100 })
    expect(bloque.reserva.codigo_reserva).toBe('RES-2026-0001')
  })

  it('solo las aprobadas y las pendientes ocupan el ambiente; las de otra semana no entran', () => {
    const bloques = bloquesDeLaAgenda(
      [
        reserva('A', '2026-11-09', '08:00', '09:00', 'Aprobada'),
        reserva('P', '2026-11-10', '08:00', '09:00', 'Pendiente'),
        reserva('R', '2026-11-11', '08:00', '09:00', 'Rechazada'),
        reserva('C', '2026-11-12', '08:00', '09:00', 'Cancelada'),
        reserva('Otra semana', '2026-11-16', '08:00', '09:00'),
      ],
      '2026-11-09',
    )

    expect(bloques.map((bloque) => bloque.reserva.codigo_reserva)).toEqual(['A', 'P'])
  })

  it('una reserva hasta las 22:00 termina justo al final de la agenda', () => {
    const [bloque] = bloquesDeLaAgenda([reserva('N', '2026-11-15', '20:00', '22:00')], '2026-11-09')

    expect(bloque.dia).toBe(6)
    expect(bloque.arriba + bloque.alto).toBeCloseTo(100)
  })
})
