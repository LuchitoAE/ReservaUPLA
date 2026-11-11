import { Link } from 'react-router'
import { Icono } from '../components/ui/Icono'

// En el teléfono, la acción principal del sistema (diseño T2): un botón flotante que sigue a la vista al desplazar,
// en lugar del botón de la barra lateral, que ahí queda dentro del menú.
export function AccionFlotante() {
  return (
    <Link
      to="/reservas/nueva"
      className="fixed right-4 bottom-4 z-30 inline-flex min-h-14 items-center gap-2 rounded-full bg-acento px-5 font-semibold text-acento-texto shadow-lg transition hover:brightness-95 active:translate-y-px focus-visible:outline-3 focus-visible:outline-foco lg:hidden"
    >
      <Icono nombre="nueva" />
      Nueva reserva
    </Link>
  )
}
