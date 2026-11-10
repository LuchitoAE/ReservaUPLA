import { useCallback, useSyncExternalStore } from 'react'

// Si una consulta de medios se cumple ahora, por ejemplo el ancho de escritorio o la preferencia de reducir el
// movimiento; el componente se vuelve a dibujar cuando cambia (al girar la pantalla o al cambiar la preferencia).
export function useConsultaDeMedio(consulta) {
  const suscribir = useCallback(
    (avisar) => {
      const medio = window.matchMedia(consulta)
      medio.addEventListener('change', avisar)
      return () => medio.removeEventListener('change', avisar)
    },
    [consulta],
  )
  return useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches)
}
