import { useSyncExternalStore } from 'react'

function suscribir(avisar) {
  document.addEventListener('visibilitychange', avisar)
  return () => document.removeEventListener('visibilitychange', avisar)
}

function estaVisible() {
  return document.visibilityState === 'visible'
}

// Si la pestaña está a la vista. Lo que se mueve se detiene cuando la persona cambia de pestaña o minimiza (RNF-06).
export function usePestanaVisible() {
  return useSyncExternalStore(suscribir, estaVisible)
}
