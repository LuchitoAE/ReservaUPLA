import { useEffect } from 'react'
import { usePreferencias } from '../hooks/usePreferencias'
import { elegirEstrategiaDeSonido } from './estrategiasDeSonido'

// Observador de la central de avisos (patrón Observer) que usa una estrategia de sonido (patrón Strategy): cuando se
// muestra un aviso, le pide a la estrategia elegida que suene según su tipo. Solo reacciona a avisos nuevos, que
// siempre siguen a una acción: nunca suena al cargar una página (RF-14). No dibuja nada.
export function ReproductorDeSonido({ central }) {
  const { sonidoEncendido } = usePreferencias()

  useEffect(() => {
    const estrategia = elegirEstrategiaDeSonido(sonidoEncendido)
    return central.suscribir((evento) => {
      if (evento.accion === 'mostrado') {
        estrategia.reproducir(evento.aviso.tipo)
      }
    })
  }, [central, sonidoEncendido])

  return null
}
