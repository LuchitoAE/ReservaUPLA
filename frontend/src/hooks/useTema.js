import { useEffect, useState } from 'react'
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

  function alternar() {
    const nuevo = tema === 'oscuro' ? 'claro' : 'oscuro'
    guardarPreferencia(CLAVE, nuevo)
    setTema(nuevo)
  }

  return { tema, alternar }
}
