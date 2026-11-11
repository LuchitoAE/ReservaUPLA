import { describe, expect, it } from 'vitest'
import { alcanceDelUsuario, contarPorEstado, leerFiltros, ordenarPorFecha } from './modeloDeFiltros'

const administrador = { id_usuario: 1, rol_usuario: 'Administrador' }
const solicitante = { id_usuario: 7, rol_usuario: 'Solicitante' }
const responsable = { id_usuario: 2, rol_usuario: 'ResponsableDeAmbiente' }

// RF-05: los filtros viven en la dirección y el rol decide qué parte de las reservas se ve primero.
describe('leerFiltros', () => {
  it('lee los cinco filtros de la dirección', () => {
    const parametros = new URLSearchParams({
      estado_reserva: 'Pendiente',
      id_ambiente: '3',
      fecha_desde: '2026-11-01',
      fecha_hasta: '2026-11-30',
      texto: 'lab',
    })

    expect(leerFiltros(parametros)).toEqual({
      estado_reserva: 'Pendiente',
      id_ambiente: '3',
      fecha_desde: '2026-11-01',
      fecha_hasta: '2026-11-30',
      texto: 'lab',
    })
  })

  it('deja vacíos los que no están', () => {
    expect(leerFiltros(new URLSearchParams())).toEqual({
      estado_reserva: '',
      id_ambiente: '',
      fecha_desde: '',
      fecha_hasta: '',
      texto: '',
    })
  })
})

describe('alcanceDelUsuario', () => {
  it('el administrador ve todas las reservas', () => {
    expect(alcanceDelUsuario(administrador, new URLSearchParams())).toEqual({
      alcance: null,
      soloLoMio: false,
      filtroDeAlcance: {},
    })
  })

  it('el solicitante empieza por sus reservas', () => {
    const { alcance, soloLoMio, filtroDeAlcance } = alcanceDelUsuario(solicitante, new URLSearchParams())

    expect(alcance.texto).toBe('Solo mis reservas')
    expect(soloLoMio).toBe(true)
    expect(filtroDeAlcance).toEqual({ id_usuario: 7 })
  })

  it('el responsable empieza por los ambientes a su cargo', () => {
    expect(alcanceDelUsuario(responsable, new URLSearchParams()).filtroDeAlcance).toEqual({ id_responsable_ambiente: 2 })
  })

  it('«todas=1» quita el alcance del rol', () => {
    const { soloLoMio, filtroDeAlcance } = alcanceDelUsuario(solicitante, new URLSearchParams('todas=1'))

    expect(soloLoMio).toBe(false)
    expect(filtroDeAlcance).toEqual({})
  })

  it('sin sesión no hay alcance', () => {
    expect(alcanceDelUsuario(null, new URLSearchParams()).alcance).toBeNull()
  })
})

describe('contarPorEstado', () => {
  it('cuenta cada estado e ignora los que no son del listado', () => {
    const reservas = [
      { estado_reserva: 'Pendiente' },
      { estado_reserva: 'Pendiente' },
      { estado_reserva: 'Aprobada' },
      { estado_reserva: 'Cancelada' },
      { estado_reserva: 'Otro' },
    ]

    expect(contarPorEstado(reservas)).toEqual({ total: 5, Pendiente: 2, Aprobada: 1, Rechazada: 0, Cancelada: 1 })
  })

  it('sin reservas, todos los conteos quedan en cero', () => {
    expect(contarPorEstado()).toEqual({ total: 0, Pendiente: 0, Aprobada: 0, Rechazada: 0, Cancelada: 0 })
  })
})

describe('ordenarPorFecha', () => {
  it('ordena de la fecha más próxima a la más lejana y no cambia la lista original', () => {
    const reservas = [
      { codigo_reserva: 'C', fecha_reserva: '2026-11-12', hora_inicio_reserva: '08:00' },
      { codigo_reserva: 'A', fecha_reserva: '2026-11-10', hora_inicio_reserva: '15:00' },
      { codigo_reserva: 'B', fecha_reserva: '2026-11-10', hora_inicio_reserva: '09:00' },
    ]

    expect(ordenarPorFecha(reservas).map((reserva) => reserva.codigo_reserva)).toEqual(['B', 'A', 'C'])
    expect(reservas.map((reserva) => reserva.codigo_reserva)).toEqual(['C', 'A', 'B'])
  })
})
