import { describe, expect, it, vi } from 'vitest'
import { crearSonidoCorto, elegirEstrategiaDeSonido, sonidoApagado, tonosPara } from './estrategiasDeSonido'

// Patrón Strategy (SDD, vista de patrones) y RF-14: el reproductor pide «reproducir(tipo)» sin saber si suena.
describe('tonosPara', () => {
  it('lo que salió bien suena ascendente', () => {
    for (const tipo of ['aprobada', 'pendiente', 'exito']) {
      const [primero, segundo] = tonosPara(tipo)
      expect(segundo.frecuencia).toBeGreaterThan(primero.frecuencia)
    }
  })

  it('un rechazo, una cancelación o un error al enviar suenan descendente', () => {
    for (const tipo of ['rechazada', 'cancelada', 'error']) {
      const [primero, segundo] = tonosPara(tipo)
      expect(segundo.frecuencia).toBeLessThan(primero.frecuencia)
    }
  })

  it('un aviso informativo no suena', () => {
    expect(tonosPara('info')).toEqual([])
  })

  it('cada sonido dura menos de 0,3 s', () => {
    for (const tipo of ['aprobada', 'rechazada']) {
      const fin = Math.max(...tonosPara(tipo).map(({ inicio, duracion }) => inicio + duracion))
      expect(fin).toBeLessThan(0.3)
    }
  })
})

// Un AudioContext de mentira que anota los osciladores que se crean.
function contextoFalso() {
  const parametro = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() })
  const contexto = {
    currentTime: 10,
    destination: {},
    osciladores: [],
    createOscillator() {
      const oscilador = { type: '', frequency: parametro(), connect: (nodo) => nodo, start: vi.fn(), stop: vi.fn() }
      contexto.osciladores.push(oscilador)
      return oscilador
    },
    createGain: () => ({ gain: parametro(), connect: (nodo) => nodo }),
  }
  return contexto
}

describe('estrategias', () => {
  it('SonidoCorto toca los tonos del tipo de aviso', () => {
    const contexto = contextoFalso()
    crearSonidoCorto(() => contexto).reproducir('aprobada')

    expect(contexto.osciladores.map((o) => o.frequency.value)).toEqual(tonosPara('aprobada').map((t) => t.frecuencia))
    expect(contexto.osciladores[0].start).toHaveBeenCalledWith(10)
  })

  it('SonidoCorto no crea el contexto de audio si el aviso no suena', () => {
    const crear = vi.fn(contextoFalso)
    crearSonidoCorto(crear).reproducir('info')

    expect(crear).not.toHaveBeenCalled()
  })

  it('SonidoApagado no hace nada', () => {
    expect(() => sonidoApagado.reproducir('aprobada')).not.toThrow()
  })

  it('la preferencia elige la estrategia: empieza apagado', () => {
    expect(elegirEstrategiaDeSonido(false)).toBe(sonidoApagado)
    expect(elegirEstrategiaDeSonido(true)).not.toBe(sonidoApagado)
  })
})
