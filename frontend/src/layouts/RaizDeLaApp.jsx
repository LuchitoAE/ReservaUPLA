import { Outlet, ScrollRestoration } from 'react-router'
import { ProveedorDeSesion } from '../contexto/ProveedorDeSesion'

// Raíz de la SPA: la sesión envuelve a todas las páginas, la de ingreso y las del sistema.
export function RaizDeLaApp() {
  return (
    <ProveedorDeSesion>
      <Outlet />
      <ScrollRestoration />
    </ProveedorDeSesion>
  )
}
