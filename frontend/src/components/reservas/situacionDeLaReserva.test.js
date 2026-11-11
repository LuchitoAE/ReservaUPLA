import { describe, expect, it } from 'vitest'
import { cruceAprobado, situacionDeLaReserva } from './situacionDeLaReserva'

// RNF-05 y diseños AD06/AD08/AD09/S13/S14: la tarjeta de la decisión dice en qué está la reserva con el color del
// semáforo; si una pendiente choca con una aprobada, lo dice en ámbar y no deja aprobar (RN-01, RN-08).
describe('situacionDeLaReserva', () => {
  const reserva = {
    estado_reserva: 'Pendiente',
    nombre_ambiente: 'Laboratorio de cómputo 1',
    fecha_reserva: '2026-11-11',
  }

  it.each([
    ['Aprobada', 'exito', 'Aprobada'],
    ['Rechazada', 'error', 'Rechazada'],
    ['Cancelada', 'cancelada', 'Cancelada'],
  ])('%s se muestra como «%s» con el título «%s»', (estado, tipo, titulo) => {
    expect(situacionDeLaReserva({ ...reserva, estado_reserva: estado }, { esAdministrador: true })).toMatchObject({
      tipo,
      titulo,
      sePuedeAprobar: true,
    })
  })

  it('una pendiente libre se ve en verde y dice que el horario sigue libre (AD06)', () => {
    expect(situacionDeLaReserva(reserva, { esAdministrador: true })).toMatchObject({
      tipo: 'exito',
      titulo: 'El horario sigue libre',
      texto: 'No se cruza con otra reserva aprobada del Laboratorio de cómputo 1.',
      sePuedeAprobar: true,
    })
  })

  it('una pendiente que choca con una aprobada se ve en ámbar y no se puede aprobar (AD09)', () => {
    const situacion = situacionDeLaReserva(reserva, {
      esAdministrador: true,
      cruce: { codigo_reserva: 'RES-2026-0001', hora_inicio_reserva: '08:00', hora_fin_reserva: '10:00' },
    })

    expect(situacion).toMatchObject({ tipo: 'aviso', titulo: 'Choca con una reserva aprobada', sePuedeAprobar: false })
    expect(situacion.texto).toBe(
      'RES-2026-0001 ocupa el Laboratorio de cómputo 1 el 11/11/2026 de 08:00 a 10:00. No se puede aprobar; puede rechazarla.',
    )
  })

  it('los textos de la tarjeta son cortos (RNF-04)', () => {
    const cruce = { codigo_reserva: 'RES-2026-0001', hora_inicio_reserva: '08:00', hora_fin_reserva: '10:00' }
    for (const estado of ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada']) {
      for (const opciones of [{ esAdministrador: true }, { esAdministrador: false }, { esAdministrador: true, cruce }]) {
        expect(situacionDeLaReserva({ ...reserva, estado_reserva: estado }, opciones).texto.length).toBeLessThanOrEqual(120)
      }
    }
  })

  it('al solicitante le explica quién decide', () => {
    expect(situacionDeLaReserva(reserva, { esAdministrador: false }).texto).toMatch(/administrador/)
  })

  it('los estados finales dicen qué pasó y qué puede hacer (S13 y S14)', () => {
    expect(situacionDeLaReserva({ ...reserva, estado_reserva: 'Rechazada' }).texto).toMatch(/registre una nueva solicitud/)
    expect(situacionDeLaReserva({ ...reserva, estado_reserva: 'Cancelada' }).texto).toMatch(/ya no puede reactivarse/)
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
