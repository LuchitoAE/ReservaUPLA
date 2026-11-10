import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { AvisoFlotante } from './AvisoFlotante'

// Observador que pinta los avisos (RNF-04): abajo a la derecha, encima del contenido, sin moverlo. Es una región
// role="status": el lector de pantalla lee cada aviso nuevo sin interrumpir (WCAG 4.1.3). Esc cierra el más reciente,
// salvo que haya una ventana de confirmación abierta (esa tecla es suya). En el teléfono ocupa el ancho de la pantalla.
export function RegionDeAvisos({ central }) {
  const avisos = useSyncExternalStore(central.suscribir, central.obtener)
  // La misma función para todos y en cada dibujo: así llegar otro aviso no reinicia el plazo de los anteriores.
  const cerrar = useCallback((id) => central.cerrar(id), [central])

  useEffect(() => {
    function alPulsar(evento) {
      const ultimo = central.obtener().at(-1)
      if (evento.key === 'Escape' && ultimo && !document.querySelector('dialog[open]')) {
        central.cerrar(ultimo.id)
      }
    }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [central])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Avisos"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:right-8 sm:bottom-8 sm:w-[25rem]"
    >
      {avisos.map((aviso) => (
        <AvisoFlotante key={aviso.id} aviso={aviso} alCerrar={cerrar} />
      ))}
    </div>
  )
}
