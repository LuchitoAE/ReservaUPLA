import { AlertMessage } from '../ui/AlertMessage'
import { APARIENCIA, textoDeDisponibilidad } from './disponibilidad'

// Mensaje de estado de la tarjeta (diseño S04): conserva el alto fijo (RNF-04) y no se anuncia como una acción nueva,
// porque describe un estado mientras se llena el formulario.
export function MensajeDeDisponibilidad({ disponibilidad, solicitud }) {
  const { estado, mensaje } = disponibilidad
  const apariencia = APARIENCIA[estado]

  return (
    <div aria-live="polite">
      <AlertMessage
        tipo={apariencia.tipo}
        titulo={apariencia.titulo}
        anunciar={false}
        className={`min-h-32 ${estado === 'error' ? 'break-words' : ''}`}
      >
        {textoDeDisponibilidad({ estado, mensaje, solicitud })}
      </AlertMessage>
    </div>
  )
}
