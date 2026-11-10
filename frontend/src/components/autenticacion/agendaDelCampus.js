// Reglas del panel «Agenda del campus» del ingreso (RNF-06; diseño en Penpot, 02 Acceso, AC01 y su estudio). El
// sistema reserva ambientes por bloques de horario: el panel es una agenda sobre las fotos del campus que tomó el alumno.
// Se ven en el azul de la marca a través de una rejilla de bloques; tres bloques muestran la foto a color (reservados)
// y uno lleva borde dorado (el que se está eligiendo). Funciones puras: no tocan el DOM y reciben el azar como
// parámetro, para poder probarlas.

export const COLUMNAS = 5
export const FILAS = 7
export const TOTAL_DE_FOTOS = 4
export const RESERVADOS_A_LA_VEZ = 3

// Encuadre de cada foto, igual que en Penpot (biblioteca-5-panel-propio.js): zoom y desplazamiento de la foto en px de
// un panel de 900 px de alto, bloques a color y bloque dorado al abrir. En el teléfono, el desplazamiento en px de una
// franja de 300 px de alto, con la foto de 450 px; la del teléfono es fija y siempre igual (T1).
export const ENCUADRES = {
  1: { zoom: 1.25, x: 800, y: 60, reservados: [[2, 4], [3, 1], [3, 3]], elegido: [4, 3], telefono: { x: 330, y: 40 } },
  2: { zoom: 1.25, x: 600, y: 70, reservados: [[3, 4], [2, 3], [3, 0]], elegido: [4, 2], telefono: { x: 232, y: 28 } },
  3: { zoom: 1.1, x: 176, y: 0, reservados: [[2, 2], [1, 4], [3, 3]], elegido: [4, 1], telefono: { x: 98, y: 0 } },
  4: { zoom: 1.2, x: 820, y: 100, reservados: [[2, 2], [3, 4], [3, 2]], elegido: [4, 1], telefono: { x: 342, y: 42 } },
}

export const AGENDA_DEL_TELEFONO = { columnas: 4, filas: 2, zoom: 1.5, reservados: [[0, 1], [1, 3]], elegido: [1, 1] }

// La foto de esta visita: la siguiente a la que se mostró la vez anterior (1 → 2 → 3 → 4 → 1). Nunca cambia mientras
// la persona escribe: el movimiento lo pone la agenda (ISO 9241-112, 6.2).
export function fotoDeLaVisita(ultimaMostrada) {
  const ultima = Number(ultimaMostrada)
  const valida = Number.isInteger(ultima) && ultima >= 1 && ultima <= TOTAL_DE_FOTOS
  return valida ? (ultima % TOTAL_DE_FOTOS) + 1 : 1
}

// Bloques que quedan bajo la bienvenida (filas 1 a 3, columnas 1 y 2) y bajo el pie (fila 7). Son fijos por diseño y
// van oscuros, para que el texto blanco tenga 12,5:1 o más con cualquier foto. La agenda nunca los toca.
export function estaBajoElTexto([fila, columna]) {
  return (fila <= 2 && columna <= 1) || fila === FILAS - 1
}

export function estadoInicial({ reservados, elegido }) {
  return { reservados: reservados.map((bloque) => [...bloque]), elegido: [...elegido] }
}

// Un bloque libre pasa a color y el más antiguo vuelve a azul: siempre hay tres a color.
export function avanzarAgenda(estado, azar = Math.random) {
  const libres = todosLosBloques().filter((bloque) => estaLibre(bloque, estado) && !esIgual(bloque, estado.elegido))
  if (libres.length === 0) {
    return estado
  }
  const nuevo = elegirAlAzar(libres, azar)
  return { ...estado, reservados: [...estado.reservados, nuevo].slice(-RESERVADOS_A_LA_VEZ) }
}

// El borde dorado pasa a un bloque vecino (arriba, abajo, a la izquierda o a la derecha) que esté libre.
export function moverElegido(estado, azar = Math.random) {
  const [fila, columna] = estado.elegido
  const vecinos = [
    [fila - 1, columna],
    [fila + 1, columna],
    [fila, columna - 1],
    [fila, columna + 1],
  ].filter((bloque) => estaEnLaRejilla(bloque) && estaLibre(bloque, estado))
  if (vecinos.length === 0) {
    return estado
  }
  return { ...estado, elegido: elegirAlAzar(vecinos, azar) }
}

function todosLosBloques() {
  const bloques = []
  for (let fila = 0; fila < FILAS; fila++) {
    for (let columna = 0; columna < COLUMNAS; columna++) {
      bloques.push([fila, columna])
    }
  }
  return bloques
}

function estaLibre(bloque, { reservados }) {
  return !estaBajoElTexto(bloque) && !reservados.some((reservado) => esIgual(reservado, bloque))
}

function estaEnLaRejilla([fila, columna]) {
  return fila >= 0 && fila < FILAS && columna >= 0 && columna < COLUMNAS
}

function esIgual([fila1, columna1], [fila2, columna2]) {
  return fila1 === fila2 && columna1 === columna2
}

function elegirAlAzar(lista, azar) {
  return lista[Math.min(Math.floor(azar() * lista.length), lista.length - 1)]
}
