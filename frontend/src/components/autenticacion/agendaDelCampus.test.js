import { describe, expect, it } from 'vitest'
import {
  ENCUADRES,
  FILAS,
  COLUMNAS,
  RESERVADOS_A_LA_VEZ,
  avanzarAgenda,
  estadoInicial,
  estaBajoElTexto,
  fotoDeLaVisita,
  moverElegido,
} from './agendaDelCampus'

// Azar repetible para las pruebas (mulberry32): la misma semilla da siempre la misma secuencia.
function azarConSemilla(semilla) {
  let a = semilla
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const mismo = ([f1, c1], [f2, c2]) => f1 === f2 && c1 === c2
const contiene = (lista, bloque) => lista.some((b) => mismo(b, bloque))
const enLaRejilla = ([f, c]) => f >= 0 && f < FILAS && c >= 0 && c < COLUMNAS

// Lo que siempre debe cumplirse (sección 4f del diseño): tres a color, ninguno bajo el texto y el dorado aparte.
function revisarReglas(estado) {
  expect(estado.reservados).toHaveLength(RESERVADOS_A_LA_VEZ)
  for (const bloque of estado.reservados) {
    expect(enLaRejilla(bloque)).toBe(true)
    expect(estaBajoElTexto(bloque)).toBe(false)
  }
  const distintos = new Set(estado.reservados.map((b) => b.join('-')))
  expect(distintos.size).toBe(RESERVADOS_A_LA_VEZ)
  expect(enLaRejilla(estado.elegido)).toBe(true)
  expect(estaBajoElTexto(estado.elegido)).toBe(false)
  expect(contiene(estado.reservados, estado.elegido)).toBe(false)
}

describe('fotoDeLaVisita (RNF-06: la foto cambia entre visitas)', () => {
  it('empieza por la 1 y sigue el orden 1, 2, 3, 4', () => {
    expect(fotoDeLaVisita(null)).toBe(1)
    expect(fotoDeLaVisita('1')).toBe(2)
    expect(fotoDeLaVisita('3')).toBe(4)
  })

  it('después de la 4 vuelve a la 1', () => {
    expect(fotoDeLaVisita('4')).toBe(1)
  })

  it('si lo guardado no es una foto válida, empieza por la 1', () => {
    expect(fotoDeLaVisita('x')).toBe(1)
    expect(fotoDeLaVisita('0')).toBe(1)
    expect(fotoDeLaVisita('9')).toBe(1)
  })
})

describe('estaBajoElTexto', () => {
  it('marca los bloques de la bienvenida (filas 1 a 3, columnas 1 y 2) y los del pie (fila 7)', () => {
    expect(estaBajoElTexto([0, 0])).toBe(true)
    expect(estaBajoElTexto([2, 1])).toBe(true)
    expect(estaBajoElTexto([6, 0])).toBe(true)
    expect(estaBajoElTexto([6, 4])).toBe(true)
  })

  it('deja libres los demás', () => {
    expect(estaBajoElTexto([0, 2])).toBe(false)
    expect(estaBajoElTexto([3, 0])).toBe(false)
    expect(estaBajoElTexto([5, 4])).toBe(false)
  })
})

describe('estadoInicial', () => {
  it.each([1, 2, 3, 4])('la foto %i empieza como en el diseño de Penpot y cumple las reglas', (foto) => {
    const estado = estadoInicial(ENCUADRES[foto])
    expect(estado.reservados).toEqual(ENCUADRES[foto].reservados)
    expect(estado.elegido).toEqual(ENCUADRES[foto].elegido)
    revisarReglas(estado)
  })
})

describe('avanzarAgenda (cada 2,4 s)', () => {
  it('un bloque libre pasa a color y el más antiguo vuelve a azul', () => {
    const antes = estadoInicial(ENCUADRES[1])
    const despues = avanzarAgenda(antes, () => 0)
    expect(despues.reservados.slice(0, 2)).toEqual(antes.reservados.slice(1))
    const nuevo = despues.reservados[2]
    expect(contiene(antes.reservados, nuevo)).toBe(false)
    expect(mismo(nuevo, antes.elegido)).toBe(false)
    expect(despues.elegido).toEqual(antes.elegido)
    revisarReglas(despues)
  })

  it('no cambia el estado que recibe', () => {
    const antes = estadoInicial(ENCUADRES[2])
    const copia = structuredClone(antes)
    avanzarAgenda(antes, () => 0.5)
    expect(antes).toEqual(copia)
  })

  it('cumple las reglas durante 500 pasos', () => {
    const azar = azarConSemilla(2026)
    let estado = estadoInicial(ENCUADRES[3])
    for (let paso = 0; paso < 500; paso++) {
      estado = avanzarAgenda(estado, azar)
      revisarReglas(estado)
    }
  })
})

describe('moverElegido (cada 4,8 s)', () => {
  it('el dorado pasa a un bloque vecino libre', () => {
    const antes = estadoInicial(ENCUADRES[1])
    const despues = moverElegido(antes, () => 0)
    const [f1, c1] = antes.elegido
    const [f2, c2] = despues.elegido
    expect(Math.abs(f1 - f2) + Math.abs(c1 - c2)).toBe(1)
    expect(despues.reservados).toEqual(antes.reservados)
    revisarReglas(despues)
  })

  it('se queda donde está si ningún vecino está libre', () => {
    // [5, 4]: abajo está el pie (bajo el texto); arriba y a la izquierda, reservados; a la derecha no hay más rejilla.
    const encerrado = { reservados: [[4, 4], [5, 3], [1, 2]], elegido: [5, 4] }
    expect(moverElegido(encerrado, () => 0)).toEqual(encerrado)
  })

  it('con la agenda en marcha, siempre se mueve de a un vecino y cumple las reglas', () => {
    const azar = azarConSemilla(9)
    let estado = estadoInicial(ENCUADRES[4])
    for (let paso = 0; paso < 300; paso++) {
      const antes = estado.elegido
      estado = moverElegido(avanzarAgenda(estado, azar), azar)
      const [f1, c1] = antes
      const [f2, c2] = estado.elegido
      expect(Math.abs(f1 - f2) + Math.abs(c1 - c2)).toBeLessThanOrEqual(1)
      revisarReglas(estado)
    }
  })
})
