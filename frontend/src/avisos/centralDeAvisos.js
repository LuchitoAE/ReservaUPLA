// Central de avisos (patrón Observer, SDD): el sujeto. Las páginas le piden mostrar un aviso tras una acción; la
// región que los pinta y el reproductor de sonido se suscriben y reaccionan, sin que la página sepa de ellos
// (principio abierto/cerrado: otro observador se agrega sin tocar a quien avisa). Sin React: se prueba sola.
//   aviso: { tipo, titulo, texto?, persistente? }
//   tipo:  'aprobada' | 'pendiente' | 'rechazada' | 'cancelada' (semáforo, RNF-05) | 'exito' | 'error' | 'info'
export const DURACION_MS = 8000
export const MAXIMO_A_LA_VEZ = 3

export function crearCentralDeAvisos() {
  let avisos = []
  let siguienteId = 1
  const observadores = new Set()

  function notificar(evento) {
    for (const observador of observadores) {
      observador(evento, avisos)
    }
  }

  function cerrar(id) {
    const aviso = avisos.find((actual) => actual.id === id)
    if (!aviso) {
      return
    }
    avisos = avisos.filter((actual) => actual.id !== id)
    notificar({ accion: 'cerrado', aviso })
  }

  function mostrar(aviso) {
    const nuevo = { persistente: false, ...aviso, id: siguienteId++ }
    if (avisos.length >= MAXIMO_A_LA_VEZ) {
      cerrar(avisos[0].id)
    }
    avisos = [...avisos, nuevo]
    notificar({ accion: 'mostrado', aviso: nuevo })
    return nuevo.id
  }

  function suscribir(observador) {
    observadores.add(observador)
    return () => observadores.delete(observador)
  }

  return { mostrar, cerrar, suscribir, obtener: () => avisos }
}

// RNF-04: una confirmación se cierra sola a los 8 s; un error o un aviso que pide hacer algo, no.
export function duracionDelAviso(aviso) {
  return aviso.persistente || aviso.tipo === 'error' ? null : DURACION_MS
}
