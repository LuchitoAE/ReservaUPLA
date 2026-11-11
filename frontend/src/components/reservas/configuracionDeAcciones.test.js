import { describe, expect, it } from 'vitest'
import { ACCIONES, accionesPermitidas, esAccionComoEnlace, presentacionDeLaDecision } from './configuracionDeAcciones'

const reserva = (estado, siguientes, idUsuario = 7) => ({
  estado_reserva: estado,
  estados_siguientes_reserva: siguientes,
  id_usuario: idUsuario,
})

const administrador = { id_usuario: 1, rol_usuario: 'Administrador' }
const responsable = { id_usuario: 2, rol_usuario: 'ResponsableDeAmbiente' }
const solicitante = { id_usuario: 7, rol_usuario: 'Solicitante' }

// RF-07 y RN-05: el estado decide a cuáles puede pasar y el rol, cuáles ve.
describe('accionesPermitidas', () => {
  const pendiente = reserva('Pendiente', ['Aprobada', 'Rechazada', 'Cancelada'])

  it('el administrador ve aprobar, rechazar y cancelar', () => {
    expect(accionesPermitidas(pendiente, { esAdministrador: true, esSolicitante: false })).toEqual([
      'Aprobada',
      'Rechazada',
      'Cancelada',
    ])
  })

  it('el solicitante solo puede cancelar su propia reserva', () => {
    expect(accionesPermitidas(pendiente, { esAdministrador: false, esSolicitante: true })).toEqual(['Cancelada'])
  })

  it('el responsable no decide sobre la reserva', () => {
    expect(accionesPermitidas(pendiente, { esAdministrador: false, esSolicitante: false })).toEqual([])
  })
})

describe('presentacionDeLaDecision', () => {
  it('el administrador ve la tarjeta de decisión y siempre la situación', () => {
    const presentacion = presentacionDeLaDecision(reserva('Pendiente', ['Aprobada', 'Rechazada', 'Cancelada']), administrador)

    expect(presentacion).toMatchObject({
      esAdministrador: true,
      titulo: 'Decisión',
      icono: 'aprobada',
      verSituacion: true,
      soloCancelar: false,
    })
  })

  it('el responsable ve el uso de su ambiente', () => {
    expect(presentacionDeLaDecision(reserva('Pendiente', []), responsable)).toMatchObject({
      esResponsable: true,
      titulo: 'Uso de su ambiente',
      icono: 'ambientes',
    })
  })

  it('el solicitante no ve la situación de una pendiente, pero sí la de un estado final', () => {
    const pendiente = presentacionDeLaDecision(reserva('Pendiente', ['Cancelada']), solicitante)
    const cancelada = presentacionDeLaDecision(reserva('Cancelada', []), solicitante)

    expect(pendiente.verSituacion).toBe(false)
    expect(pendiente.soloCancelar).toBe(true)
    expect(cancelada.verSituacion).toBe(true)
    expect(cancelada).toMatchObject({ titulo: 'Estado final', icono: 'cancelada', esFinal: true })
  })
})

describe('esAccionComoEnlace', () => {
  it('cancelar va como enlace solo si el administrador tiene más acciones por delante', () => {
    const permitidas = ['Aprobada', 'Rechazada', 'Cancelada']

    expect(esAccionComoEnlace('Cancelada', { esAdministrador: true, esFinal: false, permitidas })).toBe(true)
    expect(esAccionComoEnlace('Cancelada', { esAdministrador: true, esFinal: false, permitidas: ['Cancelada'] })).toBe(false)
    expect(esAccionComoEnlace('Cancelada', { esAdministrador: false, esFinal: false, permitidas })).toBe(false)
    expect(esAccionComoEnlace('Aprobada', { esAdministrador: true, esFinal: false, permitidas })).toBe(false)
  })

  it('cada acción trae su verbo y su confirmación', () => {
    expect(Object.values(ACCIONES).map((accion) => accion.verbo)).toEqual(['aprobar', 'rechazar', 'cancelar'])
  })
})
