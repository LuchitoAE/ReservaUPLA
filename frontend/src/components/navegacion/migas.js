import { matchPath } from 'react-router'
import { SECCIONES } from '../../navegacion'

// Ruta de navegación de la barra superior (diseños AC01, AD01, S01, R01, S04 y S15): «Panel principal › Reservas».
// Se deduce de la dirección y de SECCIONES, así que una página nueva no tiene que declararla.
const INICIO = { nombre: 'Panel principal', ruta: '/' }

const SUELTAS = {
  '/mi-cuenta': { nombre: 'Mi cuenta', ruta: '/mi-cuenta' },
  '/ingreso': { nombre: 'Ingreso', ruta: '/ingreso' },
}

export function migasDeRuta(pathname) {
  if (pathname === '/') {
    return [INICIO]
  }

  const seccion = SECCIONES.find(
    (candidata) =>
      candidata.ruta !== '/' &&
      candidata.activaEn.some((patron) => matchPath(patron, pathname)) &&
      !(candidata.excepto ?? []).some((patron) => matchPath(patron, pathname)),
  )
  const actual = seccion ? { nombre: seccion.nombre, ruta: seccion.ruta } : SUELTAS[pathname]

  return actual ? [INICIO, actual] : [INICIO]
}
