import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cambiarSonido, sonidoEncendido, suscribirAlSonido } from './preferenciaDeSonido'

// RF-14: el sonido empieza apagado, la preferencia se guarda en el navegador y quien la usa se entera del cambio.
describe('preferenciaDeSonido', () => {
  beforeEach(() => {
    const guardado = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (clave) => guardado.get(clave) ?? null,
      setItem: (clave, valor) => guardado.set(clave, String(valor)),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('empieza apagado', () => {
    expect(sonidoEncendido()).toBe(false)
  })

  it('se enciende, se recuerda y avisa a quien escucha', () => {
    const observador = vi.fn()
    const desuscribir = suscribirAlSonido(observador)

    cambiarSonido(true)

    expect(sonidoEncendido()).toBe(true)
    expect(localStorage.getItem('reservaupla.sonidoDeAvisos')).toBe('encendido')
    expect(observador).toHaveBeenCalledTimes(1)
    desuscribir()
  })

  it('sin almacenamiento (ventana privada) sigue apagado y no falla', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqueado')
      },
      setItem: () => {
        throw new Error('bloqueado')
      },
    })

    expect(() => cambiarSonido(true)).not.toThrow()
    expect(sonidoEncendido()).toBe(false)
  })
})
