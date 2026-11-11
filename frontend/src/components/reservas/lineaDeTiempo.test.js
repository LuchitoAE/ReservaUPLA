import { describe, expect, it } from 'vitest'
import { aHora, aMinutos, construirBloques, ventanaDeLaLinea } from './lineaDeTiempo'

// Las horas de la API viajan como «HH:mm»; la línea de tiempo las ubica en minutos desde la medianoche.
describe('aMinutos y aHora', () => {
  it('convierte en los dos sentidos', () => {
    expect(aMinutos('07:00')).toBe(420)
    expect(aMinutos('22:00')).toBe(1320)
    expect(aHora(420)).toBe('07:00')
    expect(aHora(1320)).toBe('22:00')
  })

  it('conserva los minutos de la hora', () => {
    expect(aMinutos('08:30')).toBe(510)
    expect(aHora(510)).toBe('08:30')
  })
})

describe('construirBloques', () => {
  const reserva = (codigo, inicio, fin, estado = 'Aprobada') => ({
    codigo_reserva: codigo,
    hora_inicio_reserva: inicio,
    hora_fin_reserva: fin,
    estado_reserva: estado,
  })

  it('sin nada que mostrar, no hay bloques', () => {
    expect(construirBloques({ reservasDelDia: [] })).toEqual([])
  })

  it('ubica cada reserva con su título, su detalle y su estado', () => {
    const [bloque] = construirBloques({ reservasDelDia: [reserva('RES-1', '08:00', '10:00', 'Pendiente')] })

    expect(bloque).toMatchObject({
      clave: 'RES-1',
      inicio: 480,
      fin: 600,
      titulo: '08:00 a 10:00 · RES-1',
      detalle: 'Pendiente (por aprobar)',
      estado: 'Pendiente',
      esSolicitud: false,
    })
  })

  it('la solicitud solo se dibuja cuando el horario está libre', () => {
    const solicitud = { inicio: '09:00', fin: '11:00' }

    expect(construirBloques({ reservasDelDia: [], solicitud, mostrarSolicitud: false })).toEqual([])

    const [bloque] = construirBloques({ reservasDelDia: [], solicitud, mostrarSolicitud: true })
    expect(bloque).toMatchObject({ clave: 'solicitud', detalle: 'Su solicitud', estado: 'solicitud', esSolicitud: true })
  })

  it('marca el cruce de la solicitud con una reserva pendiente', () => {
    const bloques = construirBloques({
      reservasDelDia: [reserva('RES-1', '08:00', '10:00'), reserva('RES-2', '11:00', '12:00')],
      solicitud: { inicio: '09:00', fin: '11:00' },
      mostrarSolicitud: true,
    })

    expect(bloques.map((bloque) => bloque.comparteFranja)).toEqual([true, false, true])
  })
})

describe('ventanaDeLaLinea', () => {
  const bloque = (inicio, fin) => ({ inicio: aMinutos(inicio), fin: aMinutos(fin) })

  it('sin bloques, no hay ventana', () => {
    expect(ventanaDeLaLinea([])).toBeNull()
  })

  it('empieza una hora antes del primer bloque y termina una hora después del último', () => {
    const ventana = ventanaDeLaLinea([bloque('08:00', '10:00')])

    expect(ventana.desde).toBe(aMinutos('07:00'))
    expect(ventana.horas.map(aHora)).toEqual(['07:00', '08:00', '09:00', '10:00', '11:00'])
    expect(ventana.alto).toBe(160)
  })

  it('no se sale del horario del sistema', () => {
    expect(ventanaDeLaLinea([bloque('07:00', '08:00')]).desde).toBe(aMinutos('07:00'))
    expect(ventanaDeLaLinea([bloque('20:00', '22:00')]).horas.map(aHora)).toEqual(['19:00', '20:00', '21:00', '22:00'])
  })
})
