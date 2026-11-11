import { Outlet, ScrollRestoration } from 'react-router'
import { ProveedorDeAvisos } from '../avisos/ProveedorDeAvisos'
import { ProveedorDeSesion } from '../contexto/ProveedorDeSesion'

// Raíz de la SPA: la sesión y los avisos envuelven a todas las páginas, la de ingreso y las del sistema. Los avisos
// quedan por encima de las rutas: uno que se muestra al guardar sigue visible en la página siguiente.
export function RaizDeLaApp() {
  return (
    <ProveedorDeSesion>
      <ProveedorDeAvisos>
        <Outlet />
        <ScrollRestoration />
      </ProveedorDeAvisos>
    </ProveedorDeSesion>
  )
}
