import { matchPath } from 'react-router'
import { SECCIONES } from '../../navegacion'
import { esIdentificadorDeReserva } from '../../utils/identificadores'

// Ruta de navegación de la barra superior (diseños AC01, AD01, S01, R01, S04 y S15): «Panel principal › Reservas».
// Se deduce de la dirección y de SECCIONES, así que una página nueva no tiene que declararla. Las subpáginas con
// nombre propio suman un tercer nivel (AD13 y AD16: «Panel principal › Ambientes › Nuevo ambiente»); el detalle de
// una reserva usa «Reserva» mientras carga (C08) y su código cuando ya tiene los datos (AD06, AD08 y AD09).
const INICIO = { nombre: 'Panel principal', ruta: '/' }

const SUELTAS = {
  '/mi-cuenta': { nombre: 'Mi cuenta', ruta: '/mi-cuenta' },
  '/ingreso': { nombre: 'Ingreso', ruta: '/ingreso' },
}

const SUBPAGINAS = [
  { patron: '/ambientes/nuevo', nombre: 'Nuevo ambiente' },
  { patron: '/usuarios/nuevo', nombre: 'Nuevo usuario' },
]

const DETALLE_DE_RESERVA = /^\/reservas\/(?!nueva$)[^/]+$/
const ID_DE_RESERVA = /^\/reservas\/([^/]+)$/

export function migasDeRuta(pathname, codigoDeReserva = null) {
  if (pathname === '/') {
    return [INICIO]
  }

  // Una dirección con un identificador que no es de reserva no es el detalle: es una página que no existe (C02).
  const posibleDetalle = pathname.match(ID_DE_RESERVA)
  if (posibleDetalle && posibleDetalle[1] !== 'nueva' && !esIdentificadorDeReserva(posibleDetalle[1])) {
    return [INICIO, { nombre: 'Página no encontrada' }]
  }

  const seccion = SECCIONES.find(
    (candidata) =>
      candidata.ruta !== '/' &&
      candidata.activaEn.some((patron) => matchPath(patron, pathname)) &&
      !(candidata.excepto ?? []).some((patron) => matchPath(patron, pathname)),
  )
  const actual = seccion ? { nombre: seccion.nombre, ruta: seccion.ruta } : SUELTAS[pathname]

  if (!actual) {
    return [INICIO]
  }

  const subpagina = SUBPAGINAS.find((candidata) => matchPath(candidata.patron, pathname))
  if (subpagina) {
    return [INICIO, actual, { nombre: subpagina.nombre }]
  }
  if (DETALLE_DE_RESERVA.test(pathname)) {
    return [INICIO, actual, { nombre: codigoDeReserva ?? 'Reserva' }]
  }

  return [INICIO, actual]
}
