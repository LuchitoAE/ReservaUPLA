import { useSyncExternalStore } from 'react'
import { cambiarSonido, sonidoEncendido, suscribirAlSonido } from '../sonido/preferenciaDeSonido'

// Preferencias de la persona guardadas en el navegador (RF-14): por ahora, si los avisos suenan. Todos los
// componentes que la usan ven el mismo valor y se actualizan juntos cuando cambia.
export function usePreferencias() {
  const encendido = useSyncExternalStore(suscribirAlSonido, sonidoEncendido)
  return { sonidoEncendido: encendido, cambiarSonido }
}
