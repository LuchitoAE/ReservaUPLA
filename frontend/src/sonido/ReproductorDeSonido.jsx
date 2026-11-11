import { useEffect } from 'react'
import { elegirEstrategiaDeSonido } from './estrategiasDeSonido'
import { sonidoEncendido } from './preferenciaDeSonido'

// Observador de la central de avisos (patrón Observer) que usa una estrategia de sonido (patrón Strategy): cuando se
// muestra un aviso, la preferencia elige la estrategia y esta suena según el tipo. La preferencia se lee en ese
// momento: si la persona acaba de encender el sonido, el aviso que lo confirma ya suena. Solo reacciona a avisos
// nuevos, que siempre siguen a una acción: nunca suena al cargar una página (RF-14). No dibuja nada.
export function ReproductorDeSonido({ central }) {
  useEffect(
    () =>
      central.suscribir((evento) => {
        if (evento.accion === 'mostrado') {
          elegirEstrategiaDeSonido(sonidoEncendido()).reproducir(evento.aviso.tipo)
        }
      }),
    [central],
  )

  return null
}
