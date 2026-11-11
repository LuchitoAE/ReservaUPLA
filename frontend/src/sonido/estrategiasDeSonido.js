// Estrategias de sonido de los avisos (patrón Strategy, SDD; RF-14). Todas responden a reproducir(tipo): quien las
// usa no sabe si suena ni cómo. Un sonido nuevo es otra estrategia, sin tocar al reproductor (abierto/cerrado).
// El sonido solo acompaña a un aviso en pantalla, nunca lo reemplaza; es corto (menos de 0,3 s) y distinto para lo
// que salió bien (ascendente) y para un rechazo, una cancelación o un error al enviar (descendente).
const POSITIVOS = new Set(['aprobada', 'pendiente', 'exito'])
const NEGATIVOS = new Set(['rechazada', 'cancelada', 'error'])

// Dos notas cortas: mi y la (ascendente) o do y sol graves (descendente). Tiempos en segundos.
export function tonosPara(tipo) {
  if (POSITIVOS.has(tipo)) {
    return [
      { frecuencia: 660, inicio: 0, duracion: 0.11 },
      { frecuencia: 880, inicio: 0.12, duracion: 0.14 },
    ]
  }
  if (NEGATIVOS.has(tipo)) {
    return [
      { frecuencia: 523, inicio: 0, duracion: 0.11 },
      { frecuencia: 392, inicio: 0.12, duracion: 0.14 },
    ]
  }
  return []
}

export const sonidoApagado = { reproducir() {} }

// Con Web Audio: no hace falta ningún archivo de sonido. El contexto se crea en el primer aviso, que siempre sigue a
// un clic de la persona (los navegadores no dejan sonar antes de una interacción).
export function crearSonidoCorto(crearContexto = () => new AudioContext()) {
  let contexto = null

  return {
    reproducir(tipo) {
      const tonos = tonosPara(tipo)
      if (tonos.length === 0) {
        return
      }
      contexto ??= crearContexto()
      const ahora = contexto.currentTime
      for (const { frecuencia, inicio, duracion } of tonos) {
        const oscilador = contexto.createOscillator()
        const volumen = contexto.createGain()
        oscilador.type = 'sine'
        oscilador.frequency.value = frecuencia
        // Entra y sale suave: sin chasquidos.
        volumen.gain.setValueAtTime(0.0001, ahora + inicio)
        volumen.gain.exponentialRampToValueAtTime(0.15, ahora + inicio + 0.015)
        volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + inicio + duracion)
        oscilador.connect(volumen).connect(contexto.destination)
        oscilador.start(ahora + inicio)
        oscilador.stop(ahora + inicio + duracion)
      }
    },
  }
}

const sonidoCorto = crearSonidoCorto()

// La preferencia elige la estrategia (RF-14: empieza apagado).
export function elegirEstrategiaDeSonido(encendido) {
  return encendido ? sonidoCorto : sonidoApagado
}
