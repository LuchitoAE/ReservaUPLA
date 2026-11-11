import { describe, expect, it } from 'vitest'
import { migasDeRuta } from './migas'

const ID = '01a1c689-a5fe-7181-ab56-b0a8385b4d81'

describe('migasDeRuta', () => {
  it('el panel principal es solo «Panel principal»', () => {
    expect(migasDeRuta('/')).toEqual([{ nombre: 'Panel principal', ruta: '/' }])
  })

  it('el detalle de una reserva suma su código cuando ya se conoce (AD06)', () => {
    expect(migasDeRuta(`/reservas/${ID}`, 'RES-2026-0002').map((miga) => miga.nombre)).toEqual([
      'Panel principal',
      'Reservas',
      'RES-2026-0002',
    ])
  })

  it('mientras la reserva carga, el tercer nivel es «Reserva» (C08)', () => {
    expect(migasDeRuta(`/reservas/${ID}`).map((miga) => miga.nombre)).toEqual(['Panel principal', 'Reservas', 'Reserva'])
  })

  it('una dirección con un identificador que no es de reserva es una página que no existe (C02)', () => {
    expect(migasDeRuta('/reservas/nuevas')).toEqual([
      { nombre: 'Panel principal', ruta: '/' },
      { nombre: 'Página no encontrada' },
    ])
  })

  it('«Nueva reserva» es su propio nivel, sin pasar por «Reservas» (S04)', () => {
    expect(migasDeRuta('/reservas/nueva').map((miga) => miga.nombre)).toEqual(['Panel principal', 'Nueva reserva'])
  })
})
