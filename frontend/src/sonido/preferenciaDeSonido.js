import { guardarPreferencia, leerPreferencia } from '../utils/almacenamientoLocal'

// RF-14: si los avisos suenan. Empieza apagado (aulas, oficinas y bibliotecas) y se guarda en el navegador; quien la
// usa (el reproductor de sonido y, desde la iteración 4, el interruptor de Mi cuenta) se entera de cada cambio.
const CLAVE = 'reservaupla.sonidoDeAvisos'
const observadores = new Set()

export function sonidoEncendido() {
  return leerPreferencia(CLAVE) === 'encendido'
}

export function cambiarSonido(encendido) {
  guardarPreferencia(CLAVE, encendido ? 'encendido' : 'apagado')
  for (const observador of observadores) {
    observador()
  }
}

export function suscribirAlSonido(observador) {
  observadores.add(observador)
  return () => observadores.delete(observador)
}
