import { useLocation } from 'react-router'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { Button } from '../components/ui/Button'

// Cualquier dirección que no existe: se queda dentro del layout (con el menú a la vista) y ofrece una salida.
export function PaginaNoEncontrada() {
  const { pathname } = useLocation()

  return (
    <>
      <EncabezadoDePagina titulo="Página no encontrada" descripcion={`La dirección ${pathname} no existe en ReservaUPLA.`} />
      <div className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-6">
        <p>Revise la dirección o vuelva al inicio.</p>
        <div>
          <Button destino="/" variante="principal">
            Ir al inicio
          </Button>
        </div>
      </div>
    </>
  )
}
