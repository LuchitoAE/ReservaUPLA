import { describe, expect, it, vi } from 'vitest'
import { DURACION_MS, MAXIMO_A_LA_VEZ, crearCentralDeAvisos, duracionDelAviso } from './centralDeAvisos'

// Patrón Observer (SDD, vista de patrones): las páginas avisan a la central; la región que los muestra y el
// reproductor de sonido se suscriben sin que las páginas sepan de ellos.
describe('crearCentralDeAvisos', () => {
  it('mostrar agrega el aviso y avisa a cada observador con el aviso nuevo y la lista', () => {
    const central = crearCentralDeAvisos()
    const region = vi.fn()
    const sonido = vi.fn()
    central.suscribir(region)
    central.suscribir(sonido)

    const id = central.mostrar({ tipo: 'aprobada', titulo: 'Reserva aprobada', texto: 'RES-2026-0005' })

    const [aviso] = central.obtener()
    expect(aviso).toMatchObject({ id, tipo: 'aprobada', titulo: 'Reserva aprobada', persistente: false })
    expect(region).toHaveBeenCalledWith({ accion: 'mostrado', aviso }, [aviso])
    expect(sonido).toHaveBeenCalledWith({ accion: 'mostrado', aviso }, [aviso])
  })

  it('cerrar lo quita y avisa; cerrar dos veces no avisa de nuevo', () => {
    const central = crearCentralDeAvisos()
    const observador = vi.fn()
    const id = central.mostrar({ tipo: 'info', titulo: 'Hola' })
    central.suscribir(observador)

    central.cerrar(id)
    central.cerrar(id)

    expect(central.obtener()).toEqual([])
    expect(observador).toHaveBeenCalledTimes(1)
    expect(observador.mock.calls[0][0].accion).toBe('cerrado')
  })

  it('quien se desuscribe ya no recibe avisos', () => {
    const central = crearCentralDeAvisos()
    const observador = vi.fn()
    const desuscribir = central.suscribir(observador)

    desuscribir()
    central.mostrar({ tipo: 'info', titulo: 'Hola' })

    expect(observador).not.toHaveBeenCalled()
  })

  it('cada aviso tiene su propio id y la lista no cambia de referencia si no hay cambios', () => {
    const central = crearCentralDeAvisos()
    const a = central.mostrar({ tipo: 'info', titulo: 'A' })
    const b = central.mostrar({ tipo: 'info', titulo: 'B' })

    expect(a).not.toBe(b)
    expect(central.obtener()).toBe(central.obtener())
  })

  it(`muestra a lo más ${MAXIMO_A_LA_VEZ} a la vez: el más antiguo se cierra`, () => {
    const central = crearCentralDeAvisos()
    for (let n = 1; n <= MAXIMO_A_LA_VEZ + 1; n++) {
      central.mostrar({ tipo: 'info', titulo: `Aviso ${n}` })
    }

    const titulos = central.obtener().map((aviso) => aviso.titulo)
    expect(titulos).toHaveLength(MAXIMO_A_LA_VEZ)
    expect(titulos).not.toContain('Aviso 1')
  })
})

describe('duracionDelAviso (RNF-04)', () => {
  it('una confirmación se cierra sola a los 8 s', () => {
    expect(DURACION_MS).toBe(8000)
    expect(duracionDelAviso({ tipo: 'aprobada' })).toBe(DURACION_MS)
  })

  it('un error o un aviso con una instrucción no se cierra solo', () => {
    expect(duracionDelAviso({ tipo: 'error' })).toBeNull()
    expect(duracionDelAviso({ tipo: 'exito', persistente: true })).toBeNull()
  })
})
