import { Button } from '../components/ui/Button'
import { Icono } from '../components/ui/Icono'

// Cualquier dirección que no existe: se queda dentro del layout (con el menú a la vista) y ofrece una salida.
export function PaginaNoEncontrada() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-6 shadow-tarjeta">
      <p>Revise la dirección o vuelva al inicio.</p>
      <div className="flex flex-wrap gap-3">
        <Button destino="/" variante="principal">
          <Icono nombre="inicio" />
          Ir al panel principal
        </Button>
        <Button destino="/reservas/nueva">
          <Icono nombre="nueva" />
          Nueva reserva
        </Button>
      </div>
    </div>
  )
}
