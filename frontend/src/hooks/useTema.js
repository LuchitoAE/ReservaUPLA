import { useEffect, useRef, useState } from 'react'
import { guardarPreferencia, leerPreferencia } from '../utils/almacenamientoLocal'

const CLAVE = 'reservaupla.tema'
const SISTEMA_OSCURO = '(prefers-color-scheme: dark)'

function temaInicial() {
  return document.documentElement.dataset.tema ?? (window.matchMedia(SISTEMA_OSCURO).matches ? 'oscuro' : 'claro')
}

// Modo claro u oscuro. Empieza con el que dejó index.html (la elección guardada o, si no hay, la del sistema
// operativo) y, mientras el usuario no elija, sigue los cambios del sistema. Control del usuario (Shneiderman):
// él decide cómo ver la aplicación.
export function useTema() {
  const [tema, setTema] = useState(temaInicial)
  const temporizadorDeTema = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
  }, [tema])

  useEffect(() => {
    const consulta = window.matchMedia(SISTEMA_OSCURO)
    const alCambiarSistema = (evento) => {
      if (!leerPreferencia(CLAVE)) {
        setTema(evento.matches ? 'oscuro' : 'claro')
      }
    }
    consulta.addEventListener('change', alCambiarSistema)
    return () => consulta.removeEventListener('change', alCambiarSistema)
  }, [])

  useEffect(() => () => clearTimeout(temporizadorDeTema.current), [])

  function alternar() {
    const nuevo = tema === 'oscuro' ? 'claro' : 'oscuro'
    guardarPreferencia(CLAVE, nuevo)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTema(nuevo)
      return
    }
    // Fundido de colores: la clase queda durante el cambio y se retira al terminar la transición.
    document.documentElement.classList.add('cambiando-tema')
    clearTimeout(temporizadorDeTema.current)
    temporizadorDeTema.current = setTimeout(() => {
      document.documentElement.classList.remove('cambiando-tema')
    }, 220)
    setTema(nuevo)
  }

  return { tema, alternar }
}
